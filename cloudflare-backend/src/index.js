import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { ENTITY_SCHEMAS } from './entitySchemas.generated.js';

const ENTITY_SCHEMA_REGISTRY = ENTITY_SCHEMAS;

const KNOWN_ENTITIES = new Set(Object.keys(ENTITY_SCHEMA_REGISTRY));

const nowIso = () => new Date().toISOString();

const jsonErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
});

const userSchema = z.object({
  id: z.string(),
  full_name: z.string().optional(),
  email: z.string().optional(),
  role: z.string().optional(),
  created_date: z.string().optional(),
  updated_date: z.string().optional(),
}).passthrough();

const authSuccessSchema = z.object({
  token: z.string(),
  user: userSchema,
});

const jsonSchemaToZod = (schema, isRequired = true) => {
  if (!schema || typeof schema !== 'object') {
    return isRequired ? z.any() : z.any().optional();
  }

  let result;

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    const literals = schema.enum.map((value) => z.literal(value));
    result = literals.length === 1 ? literals[0] : z.union(literals);
  } else {
    switch (schema.type) {
      case 'string':
        result = z.string();
        break;
      case 'number':
        result = z.number();
        break;
      case 'integer':
        result = z.number().int();
        break;
      case 'boolean':
        result = z.boolean();
        break;
      case 'array':
        result = z.array(jsonSchemaToZod(schema.items || {}, true));
        break;
      case 'object': {
        const properties = schema.properties || {};
        const required = new Set(Array.isArray(schema.required) ? schema.required : []);
        const shape = {};

        for (const [key, propSchema] of Object.entries(properties)) {
          shape[key] = jsonSchemaToZod(propSchema, required.has(key));
        }

        result = z.object(shape).passthrough();
        break;
      }
      default:
        result = z.any();
    }
  }

  if (!isRequired) {
    result = result.optional();
  }

  return result;
};

const entityInputSchemas = Object.fromEntries(
  Object.entries(ENTITY_SCHEMA_REGISTRY).map(([entityName, schema]) => [entityName, jsonSchemaToZod(schema, true)])
);

const entityUpdateSchemas = Object.fromEntries(
  Object.entries(entityInputSchemas).map(([entityName, schema]) => [entityName, schema.partial()])
);

const entityResponseSchemas = Object.fromEntries(
  Object.entries(entityUpdateSchemas).map(([entityName, schema]) => [
    entityName,
    z.object({
      id: z.string(),
      created_date: z.string(),
      updated_date: z.string(),
    }).merge(schema).passthrough(),
  ])
);

const mapRow = (row) => ({
  id: row.id,
  created_date: row.created_date,
  updated_date: row.updated_date,
  ...JSON.parse(row.data),
});

const initDb = async (db) => {
  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS entity_records (entity TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, created_date TEXT NOT NULL, updated_date TEXT NOT NULL, PRIMARY KEY (entity, id))'
    )
    .run();

  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS uploaded_files (id TEXT PRIMARY KEY, name TEXT NOT NULL, mime_type TEXT, data_base64 TEXT NOT NULL, created_date TEXT NOT NULL)'
    )
    .run();

  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS auth_sessions (token TEXT PRIMARY KEY, user_data TEXT NOT NULL, created_date TEXT NOT NULL)'
    )
    .run();

  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS auth_credentials (email TEXT PRIMARY KEY, password_hash TEXT NOT NULL, updated_date TEXT NOT NULL)'
    )
    .run();
};

const hashPassword = async (password, secret = '') => {
  const input = `${password}::${secret}`;
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((part) => part.toString(16).padStart(2, '0')).join('');
};

const getBearerTokenFromHeader = (authHeader = '') => {
  const match = String(authHeader).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

const getSessionUserByToken = async (db, token) => {
  if (!token) return null;

  const row = await db
    .prepare('SELECT user_data FROM auth_sessions WHERE token = ?')
    .bind(token)
    .first();

  if (!row?.user_data) return null;

  try {
    return JSON.parse(row.user_data);
  } catch {
    return null;
  }
};

const getCurrentUser = async (c) => {
  const token = getBearerTokenFromHeader(c.req.header('Authorization') || '');
  return getSessionUserByToken(c.env.DB, token);
};

const verifyGoogleCredential = async (credential) => {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (!payload?.email || payload?.email_verified !== 'true') {
    return null;
  }

  return {
    email: payload.email,
    full_name: payload.name || payload.given_name || payload.email,
    picture: payload.picture || null,
  };
};

const upsertCredentialByEmail = async (db, email, passwordHash) => {
  const stamp = nowIso();
  await db
    .prepare('INSERT OR REPLACE INTO auth_credentials (email, password_hash, updated_date) VALUES (?, ?, ?)')
    .bind(email.toLowerCase(), passwordHash, stamp)
    .run();
};

const hasCredentialByEmail = async (db, email) => {
  const row = await db
    .prepare('SELECT email FROM auth_credentials WHERE email = ?')
    .bind(String(email).toLowerCase())
    .first();

  return Boolean(row?.email);
};

const listEntities = async (db, entity, sort = '-created_date', limit = 200) => {
  const parsedLimit = Number.parseInt(String(limit), 10);
  const safeLimit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(parsedLimit, 1000)) : 200;
  const direction = sort.startsWith('-') ? 'DESC' : 'ASC';
  const field = sort.replace(/^-/, '');

  if (field === 'created_date') {
    const result = await db
      .prepare(
        `SELECT id, data, created_date, updated_date
         FROM entity_records
         WHERE entity = ?
         ORDER BY created_date ${direction}
         LIMIT ?`
      )
      .bind(entity, safeLimit)
      .all();

    return (result.results || []).map(mapRow);
  }

  const fallback = await db
    .prepare('SELECT id, data, created_date, updated_date FROM entity_records WHERE entity = ? LIMIT ?')
    .bind(entity, safeLimit * 3)
    .all();

  return (fallback.results || [])
    .map(mapRow)
    .sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av === bv) return 0;
      if (direction === 'DESC') return av > bv ? -1 : 1;
      return av > bv ? 1 : -1;
    })
    .slice(0, safeLimit);
};

const findUserByEmail = async (db, email) => {
  const users = await listEntities(db, 'User', '-created_date', 500);
  return users.find((user) => user.email?.toLowerCase() === String(email).toLowerCase()) || null;
};

const addAuditLog = async (db, { action, entityType, entityId, details, actor }) => {
  const id = crypto.randomUUID();
  const stamp = nowIso();
  const actorEmail = String(actor?.email || '').trim();
  const actorName = String(actor?.full_name || actor?.name || '').trim();
  const payload = {
    action,
    entity_type: entityType,
    entity_id: entityId,
    user_email: actorEmail || 'system@collateral.local',
    user_name: actorName || 'System',
    details,
    branch: String(actor?.branch || 'HQ'),
  };

  await db
    .prepare(
      'INSERT INTO entity_records (entity, id, data, created_date, updated_date) VALUES (?, ?, ?, ?, ?)'
    )
    .bind('AuditLog', id, JSON.stringify(payload), stamp, stamp)
    .run();
};

const createEntityRecord = async (db, entity, payload, actor = null) => {
  const stamp = nowIso();
  const id = payload.id || crypto.randomUUID();

  await db
    .prepare('INSERT INTO entity_records (entity, id, data, created_date, updated_date) VALUES (?, ?, ?, ?, ?)')
    .bind(entity, id, JSON.stringify(payload), stamp, stamp)
    .run();

  await addAuditLog(db, {
    action: 'create',
    entityType: entity,
    entityId: id,
    details: `Created ${entity} record`,
    actor,
  });

  return {
    id,
    created_date: stamp,
    updated_date: stamp,
    ...payload,
  };
};

const updateEntityRecord = async (db, entity, id, patch, actor = null) => {
  const existing = await db
    .prepare('SELECT id, data, created_date, updated_date FROM entity_records WHERE entity = ? AND id = ?')
    .bind(entity, id)
    .first();

  if (!existing) return null;

  const stamp = nowIso();
  const merged = {
    ...JSON.parse(existing.data),
    ...patch,
  };

  await db
    .prepare('UPDATE entity_records SET data = ?, updated_date = ? WHERE entity = ? AND id = ?')
    .bind(JSON.stringify(merged), stamp, entity, id)
    .run();

  await addAuditLog(db, {
    action: 'update',
    entityType: entity,
    entityId: id,
    details: `Updated ${entity} record`,
    actor,
  });

  return {
    id,
    created_date: existing.created_date,
    updated_date: stamp,
    ...merged,
  };
};

const upsertUserByEmail = async (db, profile) => {
  const users = await listEntities(db, 'User', '-created_date', 500);
  const existing = users.find((user) => user.email?.toLowerCase() === profile.email.toLowerCase());

  if (existing) {
    const patch = {
      full_name: profile.full_name,
      picture_url: profile.picture,
    };
    const updated = await updateEntityRecord(db, 'User', existing.id, patch);
    return updated || { ...existing, ...patch };
  }

  return createEntityRecord(db, 'User', {
    full_name: profile.full_name,
    email: profile.email,
    role: 'user',
    picture_url: profile.picture,
  });
};

const upsertSeed = async (db, entity, id, payload, createdDate) => {
  const exists = await db
    .prepare('SELECT 1 FROM entity_records WHERE entity = ? AND id = ?')
    .bind(entity, id)
    .first();

  if (exists) return;

  await db
    .prepare('INSERT INTO entity_records (entity, id, data, created_date, updated_date) VALUES (?, ?, ?, ?, ?)')
    .bind(entity, id, JSON.stringify(payload), createdDate, createdDate)
    .run();
};

const seedData = async (db) => {
  const countRow = await db
    .prepare('SELECT COUNT(*) AS count FROM entity_records WHERE entity = ?')
    .bind('Collateral')
    .first();

  if ((countRow?.count || 0) > 0) return;

  const created = nowIso();
  const userId = crypto.randomUUID();
  const branchId = crypto.randomUUID();
  const borrowerId = crypto.randomUUID();
  const collateralId = crypto.randomUUID();
  const approvalId = crypto.randomUUID();
  const valuationId = crypto.randomUUID();
  const legalId = crypto.randomUUID();

  await upsertSeed(
    db,
    'User',
    userId,
    {
      full_name: 'System Admin',
      email: 'admin@collateral.local',
      role: 'admin',
    },
    created
  );

  const defaultPassword = 'Admin@123';
  const defaultHash = await hashPassword(defaultPassword, 'ucip-local');
  await upsertCredentialByEmail(db, 'admin@collateral.local', defaultHash);

  await upsertSeed(
    db,
    'Branch',
    branchId,
    {
      name: 'Mumbai Main',
      code: 'MUM-01',
      city: 'Mumbai',
      state: 'Maharashtra',
      region: 'West',
      manager_email: 'manager.mumbai@collateral.local',
      active: true,
    },
    created
  );

  await upsertSeed(
    db,
    'Borrower',
    borrowerId,
    {
      full_name: 'Ravi Sharma',
      phone: '+91-9876543210',
      email: 'ravi.sharma@example.com',
      borrower_type: 'individual',
      kyc_status: 'verified',
      city: 'Mumbai',
      state: 'Maharashtra',
      branch: 'MUM-01',
    },
    created
  );

  await upsertSeed(
    db,
    'Collateral',
    collateralId,
    {
      collateral_id: 'COL-DEMO-001',
      borrower_id: borrowerId,
      borrower_name: 'Ravi Sharma',
      type: 'property',
      sub_type: 'Residential',
      description: '2BHK apartment collateral',
      address: 'Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
      market_value: 8500000,
      distress_value: 7000000,
      loan_amount: 5000000,
      ltv_ratio: 58.82,
      status: 'under_review',
      risk_level: 'medium',
      legal_status: 'pending',
      branch: 'MUM-01',
      documents: [],
    },
    created
  );

  await upsertSeed(
    db,
    'ApprovalRequest',
    approvalId,
    {
      collateral_id: collateralId,
      collateral_ref: 'COL-DEMO-001',
      request_type: 'onboarding',
      requested_by: 'ravi.sharma@example.com',
      assigned_to: 'checker@collateral.local',
      level: 1,
      status: 'pending',
      loan_amount: 5000000,
      ltv_ratio: 58.82,
      priority: 'medium',
    },
    created
  );

  await upsertSeed(
    db,
    'Valuation',
    valuationId,
    {
      collateral_id: collateralId,
      collateral_ref: 'COL-DEMO-001',
      valuer_name: 'A. Gupta',
      valuation_type: 'initial',
      market_value: 8500000,
      distress_value: 7000000,
      valuation_date: created.split('T')[0],
      status: 'completed',
      remarks: 'Comparable recent sales support valuation.',
    },
    created
  );

  await upsertSeed(
    db,
    'LegalCheck',
    legalId,
    {
      collateral_id: collateralId,
      collateral_ref: 'COL-DEMO-001',
      officer_name: 'N. Iyer',
      title_status: 'clear',
      encumbrance_status: 'clear',
      cersai_check: 'clear',
      overall_status: 'approved',
      verification_date: created.split('T')[0],
      checklist: [],
      risk_flags: [],
    },
    created
  );

  await upsertSeed(
    db,
    'AuditLog',
    crypto.randomUUID(),
    {
      action: 'seed',
      entity_type: 'System',
      user_name: 'System Admin',
      details: 'Initialized demo data in D1 backend',
    },
    created
  );
};

const base64ToBytes = (base64) => {
  const clean = base64.replace(/\s+/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const app = new OpenAPIHono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', async (c, next) => {
  await initDb(c.env.DB);
  await seedData(c.env.DB);
  await next();
});

app.doc('/api/openapi.json', {
  openapi: '3.0.3',
  info: {
    title: 'Collateral Backend API',
    version: '1.0.0',
    description: 'Cloudflare Worker API for authentication, entity management, and file uploads.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Entities' },
    { name: 'Files' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
});

app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' }));
app.get('/swagger', swaggerUI({ url: '/api/openapi.json' }));

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Health check',
  responses: {
    200: {
      description: 'Service health status',
      content: {
        'application/json': {
          schema: z.object({ ok: z.boolean() }),
        },
      },
    },
  },
});

app.openapi(healthRoute, (c) => c.json({ ok: true }));

const authGoogleRoute = createRoute({
  method: 'post',
  path: '/api/auth/google',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({ credential: z.string() }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Authenticated successfully',
      content: {
        'application/json': {
          schema: authSuccessSchema,
        },
      },
    },
    400: { description: 'Missing credential', content: { 'application/json': { schema: jsonErrorSchema } } },
    401: { description: 'Invalid credential', content: { 'application/json': { schema: jsonErrorSchema } } },
  },
});

app.openapi(authGoogleRoute, async (c) => {
  const { credential } = c.req.valid('json');
  const googleUser = await verifyGoogleCredential(credential);
  if (!googleUser) return c.json({ error: 'Invalid Google credential' }, 401);

  const user = await upsertUserByEmail(c.env.DB, googleUser);
  const token = `${crypto.randomUUID()}${crypto.randomUUID().replace(/-/g, '')}`;
  await c.env.DB
    .prepare('INSERT INTO auth_sessions (token, user_data, created_date) VALUES (?, ?, ?)')
    .bind(token, JSON.stringify(user), nowIso())
    .run();

  return c.json({ token, user }, 200);
});

const authLoginRoute = createRoute({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({ email: z.string().email(), password: z.string() }),
        },
      },
    },
  },
  responses: {
    200: { description: 'Authenticated successfully', content: { 'application/json': { schema: authSuccessSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: jsonErrorSchema } } },
    404: { description: 'User not found', content: { 'application/json': { schema: jsonErrorSchema } } },
  },
});

app.openapi(authLoginRoute, async (c) => {
  const { email, password } = c.req.valid('json');
  const normalizedEmail = email.trim().toLowerCase();

  const cred = await c.env.DB
    .prepare('SELECT password_hash FROM auth_credentials WHERE email = ?')
    .bind(normalizedEmail)
    .first();

  if (!cred?.password_hash) return c.json({ error: 'Invalid email or password' }, 401);

  const inputHash = await hashPassword(password, 'ucip-local');
  if (inputHash !== cred.password_hash) return c.json({ error: 'Invalid email or password' }, 401);

  const user = await findUserByEmail(c.env.DB, normalizedEmail);
  if (!user) return c.json({ error: 'User not found' }, 404);

  const token = `${crypto.randomUUID()}${crypto.randomUUID().replace(/-/g, '')}`;
  await c.env.DB
    .prepare('INSERT INTO auth_sessions (token, user_data, created_date) VALUES (?, ?, ?)')
    .bind(token, JSON.stringify(user), nowIso())
    .run();

  return c.json({ token, user }, 200);
});

const authRegisterRoute = createRoute({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            full_name: z.string().min(1),
            email: z.string().email(),
            password: z.string().min(8),
          }),
        },
      },
    },
  },
  responses: {
    201: { description: 'Registered successfully', content: { 'application/json': { schema: authSuccessSchema } } },
    409: { description: 'Already exists', content: { 'application/json': { schema: jsonErrorSchema } } },
  },
});

app.openapi(authRegisterRoute, async (c) => {
  const { full_name: fullName, email, password } = c.req.valid('json');
  const normalizedEmail = email.trim().toLowerCase();

  const existingCredential = await hasCredentialByEmail(c.env.DB, normalizedEmail);
  const existingUser = await findUserByEmail(c.env.DB, normalizedEmail);
  if (existingCredential || existingUser) {
    return c.json({ error: 'An account with this email already exists' }, 409);
  }

  const user = await createEntityRecord(c.env.DB, 'User', {
    full_name: fullName.trim(),
    email: normalizedEmail,
    role: 'user',
  });

  const passwordHash = await hashPassword(password, 'ucip-local');
  await upsertCredentialByEmail(c.env.DB, normalizedEmail, passwordHash);

  const token = `${crypto.randomUUID()}${crypto.randomUUID().replace(/-/g, '')}`;
  await c.env.DB
    .prepare('INSERT INTO auth_sessions (token, user_data, created_date) VALUES (?, ?, ?)')
    .bind(token, JSON.stringify(user), nowIso())
    .run();

  return c.json({ token, user }, 201);
});

const authMeRoute = createRoute({
  method: 'get',
  path: '/api/auth/me',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Current user', content: { 'application/json': { schema: userSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: jsonErrorSchema } } },
  },
});

app.openapi(authMeRoute, async (c) => {
  const currentUser = await getCurrentUser(c);
  if (!currentUser) return c.json({ error: 'Unauthorized' }, 401);
  return c.json(currentUser, 200);
});

const collectionQuerySchema = z.object({
  sort: z.string().optional(),
  limit: z.string().optional(),
});

for (const entityName of Object.keys(ENTITY_SCHEMA_REGISTRY)) {
  const collectionPath = `/api/entities/${entityName}`;
  const itemPath = `/api/entities/${entityName}/{id}`;
  const entityInputSchema = entityInputSchemas[entityName];
  const entityUpdateSchema = entityUpdateSchemas[entityName];
  const entityResponseSchema = entityResponseSchemas[entityName];

  const listRoute = createRoute({
    method: 'get',
    path: collectionPath,
    tags: ['Entities'],
    security: [{ bearerAuth: [] }],
    request: { query: collectionQuerySchema },
    responses: {
      200: { description: `List ${entityName} records`, content: { 'application/json': { schema: z.array(entityResponseSchema) } } },
      401: { description: 'Unauthorized', content: { 'application/json': { schema: jsonErrorSchema } } },
    },
  });

  app.openapi(listRoute, async (c) => {
    const currentUser = await getCurrentUser(c);
    if (!currentUser) return c.json({ error: 'Unauthorized' }, 401);

    const { sort, limit } = c.req.valid('query');
    const rows = await listEntities(c.env.DB, entityName, sort || '-created_date', limit || '200');
    return c.json(rows, 200);
  });

  const createRouteForEntity = createRoute({
    method: 'post',
    path: collectionPath,
    tags: ['Entities'],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        required: true,
        content: { 'application/json': { schema: entityInputSchema } },
      },
    },
    responses: {
      201: { description: `${entityName} created`, content: { 'application/json': { schema: entityResponseSchema } } },
      401: { description: 'Unauthorized', content: { 'application/json': { schema: jsonErrorSchema } } },
    },
  });

  app.openapi(createRouteForEntity, async (c) => {
    const currentUser = await getCurrentUser(c);
    if (!currentUser) return c.json({ error: 'Unauthorized' }, 401);

    const payload = c.req.valid('json');
    const created = await createEntityRecord(c.env.DB, entityName, payload, currentUser);
    return c.json(created, 201);
  });

  const updateRouteForEntity = createRoute({
    method: 'put',
    path: itemPath,
    tags: ['Entities'],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ id: z.string() }),
      body: {
        required: true,
        content: { 'application/json': { schema: entityUpdateSchema } },
      },
    },
    responses: {
      200: { description: `${entityName} updated`, content: { 'application/json': { schema: entityResponseSchema } } },
      401: { description: 'Unauthorized', content: { 'application/json': { schema: jsonErrorSchema } } },
      404: { description: 'Not found', content: { 'application/json': { schema: jsonErrorSchema } } },
    },
  });

  app.openapi(updateRouteForEntity, async (c) => {
    const currentUser = await getCurrentUser(c);
    if (!currentUser) return c.json({ error: 'Unauthorized' }, 401);

    const { id } = c.req.valid('param');
    const payload = c.req.valid('json');
    const updated = await updateEntityRecord(c.env.DB, entityName, id, payload, currentUser);
    if (!updated) return c.json({ error: 'Record not found' }, 404);

    return c.json(updated, 200);
  });

  const patchRouteForEntity = createRoute({
    method: 'patch',
    path: itemPath,
    tags: ['Entities'],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ id: z.string() }),
      body: {
        required: true,
        content: { 'application/json': { schema: entityUpdateSchema } },
      },
    },
    responses: {
      200: { description: `${entityName} patched`, content: { 'application/json': { schema: entityResponseSchema } } },
      401: { description: 'Unauthorized', content: { 'application/json': { schema: jsonErrorSchema } } },
      404: { description: 'Not found', content: { 'application/json': { schema: jsonErrorSchema } } },
    },
  });

  app.openapi(patchRouteForEntity, async (c) => {
    const currentUser = await getCurrentUser(c);
    if (!currentUser) return c.json({ error: 'Unauthorized' }, 401);

    const { id } = c.req.valid('param');
    const payload = c.req.valid('json');
    const updated = await updateEntityRecord(c.env.DB, entityName, id, payload, currentUser);
    if (!updated) return c.json({ error: 'Record not found' }, 404);

    return c.json(updated, 200);
  });
}

app.get('/api/entities/:entity', async (c) => {
  const currentUser = await getCurrentUser(c);
  if (!currentUser) return c.json({ error: 'Unauthorized' }, 401);

  const entity = c.req.param('entity');
  if (!KNOWN_ENTITIES.has(entity)) {
    return c.json({ error: `Unknown entity: ${entity}` }, 404);
  }

  const sort = c.req.query('sort') || '-created_date';
  const limit = c.req.query('limit') || '200';
  const rows = await listEntities(c.env.DB, entity, sort, limit);
  return c.json(rows, 200);
});

app.post('/api/entities/:entity', async (c) => {
  const currentUser = await getCurrentUser(c);
  if (!currentUser) return c.json({ error: 'Unauthorized' }, 401);

  const entity = c.req.param('entity');
  if (!KNOWN_ENTITIES.has(entity)) {
    return c.json({ error: `Unknown entity: ${entity}` }, 404);
  }

  const payload = await c.req.json();
  const created = await createEntityRecord(c.env.DB, entity, payload, currentUser);
  return c.json(created, 201);
});

app.on(['PUT', 'PATCH'], '/api/entities/:entity/:id', async (c) => {
  const currentUser = await getCurrentUser(c);
  if (!currentUser) return c.json({ error: 'Unauthorized' }, 401);

  const entity = c.req.param('entity');
  const id = c.req.param('id');
  if (!KNOWN_ENTITIES.has(entity)) {
    return c.json({ error: `Unknown entity: ${entity}` }, 404);
  }

  const payload = await c.req.json();
  const updated = await updateEntityRecord(c.env.DB, entity, id, payload, currentUser);
  if (!updated) return c.json({ error: 'Record not found' }, 404);

  return c.json(updated, 200);
});

const uploadRoute = createRoute({
  method: 'post',
  path: '/api/integrations/core/upload-file',
  tags: ['Files'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().optional(),
            type: z.string().optional(),
            contentBase64: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: 'Uploaded', content: { 'application/json': { schema: z.object({ file_url: z.string() }) } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: jsonErrorSchema } } },
    413: { description: 'Too large', content: { 'application/json': { schema: jsonErrorSchema } } },
  },
});

app.openapi(uploadRoute, async (c) => {
  const currentUser = await getCurrentUser(c);
  if (!currentUser) return c.json({ error: 'Unauthorized' }, 401);

  const body = c.req.valid('json');
  const content = String(body.contentBase64 || '').replace(/^data:.*;base64,/, '');
  if (!content) return c.json({ error: 'Missing file content' }, 400);

  const id = `${Date.now()}-${crypto.randomUUID()}`;
  const createdDate = nowIso();

  try {
    await c.env.DB
      .prepare('INSERT INTO uploaded_files (id, name, mime_type, data_base64, created_date) VALUES (?, ?, ?, ?, ?)')
      .bind(id, String(body.name || 'upload.bin'), String(body.type || 'application/octet-stream'), content, createdDate)
      .run();
  } catch (error) {
    if (String(error?.message || '').includes('SQLITE_TOOBIG')) {
      return c.json({ error: 'File is too large. Maximum supported size is 700 KB.' }, 413);
    }
    throw error;
  }

  const origin = new URL(c.req.url).origin;
  return c.json({ file_url: `${origin}/api/uploads/${id}` }, 200);
});

const downloadUploadRoute = createRoute({
  method: 'get',
  path: '/api/uploads/{id}',
  tags: ['Files'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'Binary file content',
      content: {
        '*/*': {
          schema: z.any(),
        },
      },
    },
    404: { description: 'Not found' },
  },
});

app.openapi(downloadUploadRoute, async (c) => {
  const { id } = c.req.valid('param');
  const file = await c.env.DB
    .prepare('SELECT mime_type, data_base64 FROM uploaded_files WHERE id = ?')
    .bind(id)
    .first();

  if (!file) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(base64ToBytes(file.data_base64), {
    status: 200,
    headers: {
      'Content-Type': file.mime_type || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

app.notFound((c) => c.json({ error: 'Route not found' }, 404));

app.onError((error, c) => c.json({ error: 'Internal server error', message: error.message }, 500));

export default app;
