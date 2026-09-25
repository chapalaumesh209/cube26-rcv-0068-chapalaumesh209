import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["operator", "reviewer", "admin", "evaluator"] }).notNull(),
  passwordHash: text("password_hash").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  sku: text("sku").notNull(),
  asin: text("asin"),
  title: text("title"),
  colour: text("colour"),
  variant: text("variant"),
  componentsJson: text("components_json"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const purchaseOrders = sqliteTable("purchase_orders", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  poNumber: text("po_number").notNull(),
  supplier: text("supplier"),
  status: text("status").notNull().default("open"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const poLines = sqliteTable("po_lines", {
  id: text("id").primaryKey(),
  poId: text("po_id").notNull().references(() => purchaseOrders.id),
  orgId: text("org_id").notNull().references(() => organizations.id),
  lineNumber: integer("line_number").notNull(),
  productId: text("product_id").notNull().references(() => products.id),
  qtyOrdered: integer("qty_ordered").notNull(),
  cartonsOrdered: integer("cartons_ordered").notNull(),
  unitsPerCarton: integer("units_per_carton").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const shipments = sqliteTable("shipments", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  poId: text("po_id").notNull().references(() => purchaseOrders.id),
  shipmentRef: text("shipment_ref"),
  status: text("status").notNull().default("in_transit"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const units = sqliteTable("units", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  shipmentId: text("shipment_id").references(() => shipments.id),
  poLineId: text("po_line_id").notNull().references(() => poLines.id),
  unitCode: text("unit_code").notNull().unique(),
  sku: text("sku").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const inspections = sqliteTable("inspections", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  unitId: text("unit_id").notNull().references(() => units.id),
  operatorId: text("operator_id").notNull().references(() => users.id),
  status: text("status", { enum: ["pending", "running", "completed", "failed"] }).notNull().default("pending"),
  overallVerdict: text("overall_verdict", { enum: ["pass", "exception", "uncertain"] }),
  modelVersion: text("model_version"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  failOpen: integer("fail_open", { mode: "boolean" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const inspectionChecks = sqliteTable("inspection_checks", {
  id: text("id").primaryKey(),
  inspectionId: text("inspection_id").notNull().references(() => inspections.id),
  checkKey: text("check_key").notNull(),
  verdict: text("verdict", { enum: ["pass", "fail", "uncertain"] }).notNull(),
  confidence: real("confidence"),
  detailJson: text("detail_json"),
  modelVersion: text("model_version"),
  latencyMs: integer("latency_ms"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const inspectionPhotos = sqliteTable("inspection_photos", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  inspectionId: text("inspection_id").notNull().references(() => inspections.id),
  objectKey: text("object_key").notNull(),
  sha256: text("sha256"),
  mime: text("mime"),
  width: integer("width"),
  height: integer("height"),
  role: text("role"),
  capturedAt: integer("captured_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const evidenceRecords = sqliteTable("evidence_records", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  inspectionId: text("inspection_id").notNull().references(() => inspections.id),
  schemaVersion: text("schema_version").default("rcv.v1"),
  payloadJson: text("payload_json").notNull(),
  contentHash: text("content_hash"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const overrides = sqliteTable("overrides", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  inspectionId: text("inspection_id").notNull().references(() => inspections.id),
  actorId: text("actor_id").notNull().references(() => users.id),
  originalVerdict: text("original_verdict").notNull(),
  newVerdict: text("new_verdict").notNull(),
  reason: text("reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  actorId: text("actor_id").notNull(),
  eventType: text("event_type").notNull(),
  objectType: text("object_type").notNull(),
  objectId: text("object_id").notNull(),
  payloadHash: text("payload_hash"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Aliases for compatibility
export const purchase_orders = purchaseOrders;
export const po_lines = poLines;
export const purchaseOrderLines = poLines;
export const inspection_checks = inspectionChecks;
export const inspection_photos = inspectionPhotos;
export const evidence_records = evidenceRecords;
export const audit_events = auditEvents;
export const manualOverrides = overrides;
