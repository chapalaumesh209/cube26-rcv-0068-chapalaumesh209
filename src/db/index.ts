import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "dockproof.db");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const sqlite = new Database(dbPath);

sqlite.exec(`
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  sku TEXT NOT NULL,
  asin TEXT,
  title TEXT,
  colour TEXT,
  variant TEXT,
  components_json TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  po_number TEXT NOT NULL,
  supplier TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS po_lines (
  id TEXT PRIMARY KEY,
  po_id TEXT NOT NULL REFERENCES purchase_orders(id),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  line_number INTEGER NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id),
  qty_ordered INTEGER NOT NULL,
  cartons_ordered INTEGER NOT NULL,
  units_per_carton INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  po_id TEXT NOT NULL REFERENCES purchase_orders(id),
  shipment_ref TEXT,
  status TEXT NOT NULL DEFAULT 'in_transit',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  shipment_id TEXT REFERENCES shipments(id),
  po_line_id TEXT NOT NULL REFERENCES po_lines(id),
  unit_code TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS inspections (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  unit_id TEXT NOT NULL REFERENCES units(id),
  operator_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  overall_verdict TEXT,
  model_version TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  fail_open INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS inspection_checks (
  id TEXT PRIMARY KEY,
  inspection_id TEXT NOT NULL REFERENCES inspections(id),
  check_key TEXT NOT NULL,
  verdict TEXT NOT NULL,
  confidence REAL,
  detail_json TEXT,
  model_version TEXT,
  latency_ms INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS inspection_photos (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  inspection_id TEXT NOT NULL REFERENCES inspections(id),
  object_key TEXT NOT NULL,
  sha256 TEXT,
  mime TEXT,
  width INTEGER,
  height INTEGER,
  role TEXT,
  captured_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_records (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  inspection_id TEXT NOT NULL REFERENCES inspections(id),
  schema_version TEXT DEFAULT 'rcv.v1',
  payload_json TEXT NOT NULL,
  content_hash TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS overrides (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  inspection_id TEXT NOT NULL REFERENCES inspections(id),
  actor_id TEXT NOT NULL REFERENCES users(id),
  original_verdict TEXT NOT NULL,
  new_verdict TEXT NOT NULL,
  reason TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  actor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  payload_hash TEXT,
  created_at INTEGER NOT NULL
);
`);

export const db = drizzle(sqlite, { schema });
