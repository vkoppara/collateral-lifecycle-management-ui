import { createServer } from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const projectRoot = resolve(__dirname, '..');
const entitiesPath = join(projectRoot, 'entites');
const dataPath = join(__dirname, 'data');
const uploadsPath = join(__dirname, 'uploads');

mkdirSync(dataPath, { recursive: true });
mkdirSync(uploadsPath, { recursive: true });

const db = new DatabaseSync(join(dataPath, 'collateral.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS entity_records (
    entity TEXT NOT NULL,
    id TEXT NOT NULL,
    data TEXT NOT NULL,
    created_date TEXT NOT NULL,
    updated_date TEXT NOT NULL,
    PRIMARY KEY (entity, id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS auth_sessions (
    token TEXT PRIMARY KEY,
    user_data TEXT NOT NULL,
    created_date TEXT NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS auth_credentials (
    email TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    updated_date TEXT NOT NULL
  );
`);

const knownEntities = (() => {
  const entityFiles = readdirSync(entitiesPath).filter((name) => {
    const file = join(entitiesPath, name);
    return statSync(file).isFile();
  });
  return new Set([...entityFiles, 'User']);
})();

const nowIso = () => new Date().toISOString();

const mapRow = (row) => ({
  id: row.id,
  created_date: row.created_date,
  updated_date: row.updated_date,
  ...JSON.parse(row.data),
});

const addAuditLog = ({ action, entityType, entityId, details }) => {
  const id = randomUUID();
  const stamp = nowIso();
  const payload = {
    action,
    entity_type: entityType,
    entity_id: entityId,
    user_email: 'admin@collateral.local',
    user_name: 'System Admin',
    details,
    branch: 'HQ',
  };

  db.prepare(
    'INSERT INTO entity_records (entity, id, data, created_date, updated_date) VALUES (?, ?, ?, ?, ?)'
  ).run('AuditLog', id, JSON.stringify(payload), stamp, stamp);
};

const listEntities = (entity, sort = '-created_date', limit = 200) => {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 1000)) : 200;
  const direction = sort.startsWith('-') ? 'DESC' : 'ASC';
  const field = sort.replace(/^-/, '');

  if (field === 'created_date') {
    const rows = db
      .prepare(
        `SELECT id, data, created_date, updated_date
         FROM entity_records
         WHERE entity = ?
         ORDER BY created_date ${direction}
         LIMIT ?`
      )
      .all(entity, safeLimit);
    return rows.map(mapRow);
  }

  const rows = db
    .prepare(
      'SELECT id, data, created_date, updated_date FROM entity_records WHERE entity = ? LIMIT ?'
    )
    .all(entity, safeLimit * 3)
    .map(mapRow)
    .sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av === bv) return 0;
      if (direction === 'DESC') return av > bv ? -1 : 1;
      return av > bv ? 1 : -1;
    });

  return rows.slice(0, safeLimit);
};

const createEntityRecord = (entity, payload) => {
  const stamp = nowIso();
  const id = payload.id || randomUUID();

  db.prepare(
    'INSERT INTO entity_records (entity, id, data, created_date, updated_date) VALUES (?, ?, ?, ?, ?)'
  ).run(entity, id, JSON.stringify(payload), stamp, stamp);

  addAuditLog({
    action: 'create',
    entityType: entity,
    entityId: id,
    details: `Created ${entity} record`,
  });

  return {
    id,
    created_date: stamp,
    updated_date: stamp,
    ...payload,
  };
};

const updateEntityRecord = (entity, id, patch) => {
  const row = db
    .prepare('SELECT id, data, created_date, updated_date FROM entity_records WHERE entity = ? AND id = ?')
    .get(entity, id);

  if (!row) return null;

  const stamp = nowIso();
  const merged = {
    ...JSON.parse(row.data),
    ...patch,
  };

  db.prepare('UPDATE entity_records SET data = ?, updated_date = ? WHERE entity = ? AND id = ?').run(
    JSON.stringify(merged),
    stamp,
    entity,
    id
  );

  addAuditLog({
    action: 'update',
    entityType: entity,
    entityId: id,
    details: `Updated ${entity} record`,
  });

  return {
    id,
    created_date: row.created_date,
    updated_date: stamp,
    ...merged,
  };
};

const upsertSeed = (entity, id, payload, createdDate) => {
  const exists = db
    .prepare('SELECT 1 FROM entity_records WHERE entity = ? AND id = ?')
    .get(entity, id);
  if (exists) return;

  db.prepare(
    'INSERT INTO entity_records (entity, id, data, created_date, updated_date) VALUES (?, ?, ?, ?, ?)'
  ).run(entity, id, JSON.stringify(payload), createdDate, createdDate);
};

const seedData = () => {
  const collCount = db
    .prepare('SELECT COUNT(*) AS count FROM entity_records WHERE entity = ?')
    .get('Collateral').count;

  if (collCount > 0) return;

  const created = nowIso();
  const userId = randomUUID();
  const branchId = randomUUID();
  const borrowerId = randomUUID();
  const collateralId = randomUUID();
  const approvalId = randomUUID();
  const valuationId = randomUUID();
  const legalId = randomUUID();

  upsertSeed(
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
  const defaultHash = hashPassword(defaultPassword, 'ucip-local');
  upsertCredentialByEmail('admin@collateral.local', defaultHash);

  upsertSeed(
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

  upsertSeed(
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

  upsertSeed(
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

  upsertSeed(
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

  upsertSeed(
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

  upsertSeed(
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

  upsertSeed(
    'AuditLog',
    randomUUID(),
    {
      action: 'seed',
      entity_type: 'System',
      user_name: 'System Admin',
      details: 'Initialized demo data in SQLite backend',
    },
    created
  );
};

seedData();

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(payload));
};

const text = (res, statusCode, payload, contentType = 'text/plain') => {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
  });
  res.end(payload);
};

const readJsonBody = async (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

const hashPassword = (password, secret = '') =>
  createHash('sha256').update(`${password}::${secret}`).digest('hex');

const getSessionUser = (req) => {
  const token = getBearerToken(req);
  if (!token) return null;

  const session = db.prepare('SELECT user_data FROM auth_sessions WHERE token = ?').get(token);
  if (!session?.user_data) return null;

  try {
    return JSON.parse(session.user_data);
  } catch {
    return null;
  }
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

const upsertCredentialByEmail = (email, passwordHash) => {
  db.prepare('INSERT OR REPLACE INTO auth_credentials (email, password_hash, updated_date) VALUES (?, ?, ?)').run(
    email.toLowerCase(),
    passwordHash,
    nowIso()
  );
};

const findUserByEmail = (email) => {
  const users = listEntities('User', '-created_date', 500);
  return users.find((user) => user.email?.toLowerCase() === String(email).toLowerCase()) || null;
};

const upsertUserByEmail = (profile) => {
  const users = listEntities('User', '-created_date', 500);
  const existing = users.find((user) => user.email?.toLowerCase() === profile.email.toLowerCase());

  if (existing) {
    return updateEntityRecord('User', existing.id, {
      full_name: profile.full_name,
      picture_url: profile.picture,
    });
  }

  return createEntityRecord('User', {
    full_name: profile.full_name,
    email: profile.email,
    role: 'user',
    picture_url: profile.picture,
  });
};

const server = createServer(async (req, res) => {
  if (!req.url) {
    json(res, 400, { error: 'Invalid request' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const requestUrl = new URL(req.url, 'http://localhost:3000');
  const pathname = requestUrl.pathname;

  try {
    if (req.method === 'GET' && pathname === '/health') {
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/google') {
      const body = await readJsonBody(req);
      const credential = String(body.credential || '');

      if (!credential) {
        json(res, 400, { error: 'Missing Google credential' });
        return;
      }

      const googleUser = await verifyGoogleCredential(credential);
      if (!googleUser) {
        json(res, 401, { error: 'Invalid Google credential' });
        return;
      }

      const user = upsertUserByEmail(googleUser);
      const token = `${randomUUID()}${randomUUID().replace(/-/g, '')}`;

      db.prepare('INSERT INTO auth_sessions (token, user_data, created_date) VALUES (?, ?, ?)').run(
        token,
        JSON.stringify(user),
        nowIso()
      );

      json(res, 200, { token, user });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const body = await readJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!email || !password) {
        json(res, 400, { error: 'Email and password are required' });
        return;
      }

      const cred = db.prepare('SELECT password_hash FROM auth_credentials WHERE email = ?').get(email);
      if (!cred?.password_hash) {
        json(res, 401, { error: 'Invalid email or password' });
        return;
      }

      const inputHash = hashPassword(password, 'ucip-local');
      if (inputHash !== cred.password_hash) {
        json(res, 401, { error: 'Invalid email or password' });
        return;
      }

      const user = findUserByEmail(email);
      if (!user) {
        json(res, 404, { error: 'User not found' });
        return;
      }

      const token = `${randomUUID()}${randomUUID().replace(/-/g, '')}`;
      db.prepare('INSERT INTO auth_sessions (token, user_data, created_date) VALUES (?, ?, ?)').run(
        token,
        JSON.stringify(user),
        nowIso()
      );

      json(res, 200, { token, user });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/auth/me') {
      const user = getSessionUser(req);
      if (!user) {
        json(res, 401, { error: 'Unauthorized' });
        return;
      }

      json(res, 200, user);
      return;
    }

    const currentUser = getSessionUser(req);
    if (!currentUser && (pathname.startsWith('/api/entities/') || pathname === '/api/integrations/core/upload-file')) {
      json(res, 401, { error: 'Unauthorized' });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/integrations/core/upload-file') {
      const body = await readJsonBody(req);
      const ext = extname(body.name || '') || '.bin';
      const safeName = `${Date.now()}-${randomUUID()}${ext}`;
      const filePath = join(uploadsPath, safeName);
      const base64 = String(body.contentBase64 || '').replace(/^data:.*;base64,/, '');

      if (!base64) {
        json(res, 400, { error: 'Missing file content' });
        return;
      }

      writeFileSync(filePath, Buffer.from(base64, 'base64'));
      json(res, 200, { file_url: `http://localhost:3000/uploads/${safeName}` });
      return;
    }

    if (req.method === 'GET' && pathname.startsWith('/uploads/')) {
      const fileName = pathname.replace('/uploads/', '');
      const filePath = join(uploadsPath, fileName);

      if (!existsSync(filePath)) {
        text(res, 404, 'Not found');
        return;
      }

      const fileBuffer = readFileSync(filePath);
      text(res, 200, fileBuffer, 'application/octet-stream');
      return;
    }

    const collectionMatch = pathname.match(/^\/api\/entities\/([^/]+)$/);
    if (collectionMatch) {
      const entity = decodeURIComponent(collectionMatch[1]);
      if (!knownEntities.has(entity)) {
        json(res, 404, { error: `Unknown entity: ${entity}` });
        return;
      }

      if (req.method === 'GET') {
        const sort = requestUrl.searchParams.get('sort') || '-created_date';
        const limit = Number.parseInt(requestUrl.searchParams.get('limit') || '200', 10);
        const rows = listEntities(entity, sort, limit);
        json(res, 200, rows);
        return;
      }

      if (req.method === 'POST') {
        const payload = await readJsonBody(req);
        const created = createEntityRecord(entity, payload);
        json(res, 201, created);
        return;
      }
    }

    const itemMatch = pathname.match(/^\/api\/entities\/([^/]+)\/([^/]+)$/);
    if (itemMatch) {
      const entity = decodeURIComponent(itemMatch[1]);
      const id = decodeURIComponent(itemMatch[2]);

      if (!knownEntities.has(entity)) {
        json(res, 404, { error: `Unknown entity: ${entity}` });
        return;
      }

      if (req.method === 'PUT' || req.method === 'PATCH') {
        const payload = await readJsonBody(req);
        const updated = updateEntityRecord(entity, id, payload);
        if (!updated) {
          json(res, 404, { error: 'Record not found' });
          return;
        }
        json(res, 200, updated);
        return;
      }
    }

    json(res, 404, { error: 'Route not found' });
  } catch (error) {
    json(res, 500, { error: 'Internal server error', message: error.message });
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
