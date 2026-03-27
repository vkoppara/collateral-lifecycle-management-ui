const KNOWN_ENTITIES = new Set([
  'Collateral',
  'Borrower',
  'Branch',
  'Valuation',
  'LegalCheck',
  'AuditLog',
  'ApprovalRequest',
  'User',
]);

const nowIso = () => new Date().toISOString();

const responseHeaders = (contentType = 'application/json') => ({
  'Content-Type': contentType,
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders('application/json'),
  });

const empty = (status = 204) =>
  new Response(null, {
    status,
    headers: responseHeaders('text/plain'),
  });

const safeJsonParse = async (request) => {
  const body = await request.text();
  if (!body) return {};
  return JSON.parse(body);
};

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
};

const addAuditLog = async (db, { action, entityType, entityId, details }) => {
  const id = crypto.randomUUID();
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

  await db
    .prepare(
      'INSERT INTO entity_records (entity, id, data, created_date, updated_date) VALUES (?, ?, ?, ?, ?)'
    )
    .bind('AuditLog', id, JSON.stringify(payload), stamp, stamp)
    .run();
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

const createEntityRecord = async (db, entity, payload) => {
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
  });

  return {
    id,
    created_date: stamp,
    updated_date: stamp,
    ...payload,
  };
};

const updateEntityRecord = async (db, entity, id, patch) => {
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
  });

  return {
    id,
    created_date: existing.created_date,
    updated_date: stamp,
    ...merged,
  };
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

const handleRequest = async (request, env) => {
  await initDb(env.DB);
  await seedData(env.DB);

  const url = new URL(request.url);
  const pathname = url.pathname;

  if (request.method === 'GET' && pathname === '/health') {
    return json({ ok: true });
  }

  if (request.method === 'GET' && pathname === '/api/auth/me') {
    const users = await listEntities(env.DB, 'User', '-created_date', 1);
    const user =
      users[0] ||
      {
        id: 'cloudflare-user',
        full_name: 'Cloudflare User',
        email: 'user@collateral.local',
        role: 'admin',
      };
    return json(user);
  }

  if (request.method === 'POST' && pathname === '/api/integrations/core/upload-file') {
    const body = await safeJsonParse(request);
    const content = String(body.contentBase64 || '').replace(/^data:.*;base64,/, '');

    if (!content) {
      return json({ error: 'Missing file content' }, 400);
    }

    const id = `${Date.now()}-${crypto.randomUUID()}`;
    const createdDate = nowIso();
    try {
      await env.DB.prepare(
        'INSERT INTO uploaded_files (id, name, mime_type, data_base64, created_date) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(id, String(body.name || 'upload.bin'), String(body.type || 'application/octet-stream'), content, createdDate)
        .run();
    } catch (error) {
      if (String(error?.message || '').includes('SQLITE_TOOBIG')) {
        return json({ error: 'File is too large. Maximum supported size is 700 KB.' }, 413);
      }
      throw error;
    }

    return json({ file_url: `${url.origin}/api/uploads/${id}` });
  }

  const uploadMatch = pathname.match(/^\/api\/uploads\/([^/]+)$/);
  if (request.method === 'GET' && uploadMatch) {
    const id = decodeURIComponent(uploadMatch[1]);
    const file = await env.DB
      .prepare('SELECT mime_type, data_base64 FROM uploaded_files WHERE id = ?')
      .bind(id)
      .first();

    if (!file) {
      return new Response('Not found', { status: 404, headers: responseHeaders('text/plain') });
    }

    return new Response(base64ToBytes(file.data_base64), {
      status: 200,
      headers: responseHeaders(file.mime_type || 'application/octet-stream'),
    });
  }

  const collectionMatch = pathname.match(/^\/api\/entities\/([^/]+)$/);
  if (collectionMatch) {
    const entity = decodeURIComponent(collectionMatch[1]);
    if (!KNOWN_ENTITIES.has(entity)) {
      return json({ error: `Unknown entity: ${entity}` }, 404);
    }

    if (request.method === 'GET') {
      const sort = url.searchParams.get('sort') || '-created_date';
      const limit = url.searchParams.get('limit') || '200';
      const rows = await listEntities(env.DB, entity, sort, limit);
      return json(rows);
    }

    if (request.method === 'POST') {
      const payload = await safeJsonParse(request);
      const created = await createEntityRecord(env.DB, entity, payload);
      return json(created, 201);
    }
  }

  const itemMatch = pathname.match(/^\/api\/entities\/([^/]+)\/([^/]+)$/);
  if (itemMatch) {
    const entity = decodeURIComponent(itemMatch[1]);
    const id = decodeURIComponent(itemMatch[2]);

    if (!KNOWN_ENTITIES.has(entity)) {
      return json({ error: `Unknown entity: ${entity}` }, 404);
    }

    if (request.method === 'PUT' || request.method === 'PATCH') {
      const payload = await safeJsonParse(request);
      const updated = await updateEntityRecord(env.DB, entity, id, payload);
      if (!updated) {
        return json({ error: 'Record not found' }, 404);
      }
      return json(updated);
    }
  }

  return json({ error: 'Route not found' }, 404);
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return empty();
    }

    try {
      return await handleRequest(request, env);
    } catch (error) {
      return json({ error: 'Internal server error', message: error.message }, 500);
    }
  },
};
