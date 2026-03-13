import {
  pgTable,
  text,
  integer,
  timestamp,
  numeric,
  date,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// ============ DATA LISTS (Stripe one-time purchases) ============

export const dataLists = pgTable("data_lists", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  recordCount: integer("record_count").notNull(),
  price: integer("price").notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  slug: text("slug").notNull().unique(),
});

// ============ LIQUOR LICENSE TABLES ============

export const licenses = pgTable(
  "licenses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    licenseNumber: text("license_number").notNull().unique(),
    businessName: text("business_name").notNull(),
    dba: text("dba"),
    licenseType: text("license_type").notNull(),
    licenseTypeCode: text("license_type_code"),
    status: text("status").notNull().default("active"),
    issueDate: date("issue_date"),
    expirationDate: date("expiration_date"),
    address: text("address"),
    city: text("city"),
    county: text("county"),
    state: text("state").default("TX"),
    zip: text("zip"),
    phone: text("phone"),
    email: text("email"),
    ownerName: text("owner_name"),
    mailAddress: text("mail_address"),
    mailCity: text("mail_city"),
    mailState: text("mail_state"),
    mailZip: text("mail_zip"),
    latitude: numeric("latitude"),
    longitude: numeric("longitude"),
    slug: text("slug").notNull().unique(),
    lastSyncedAt: timestamp("last_synced_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_licenses_city").on(table.city),
    index("idx_licenses_county").on(table.county),
    index("idx_licenses_zip").on(table.zip),
    index("idx_licenses_type").on(table.licenseType),
    index("idx_licenses_status").on(table.status),
    index("idx_licenses_slug").on(table.slug),
  ]
);

export const violations = pgTable(
  "violations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    licenseId: text("license_id")
      .notNull()
      .references(() => licenses.id),
    licenseNumber: text("license_number").notNull(),
    violationType: text("violation_type").notNull(),
    description: text("description"),
    date: date("date"),
    disposition: text("disposition"),
    penalty: text("penalty"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_violations_license").on(table.licenseId),
    index("idx_violations_date").on(table.date),
  ]
);

export const revenue = pgTable(
  "revenue",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    licenseId: text("license_id").references(() => licenses.id),
    licenseNumber: text("license_number"),
    businessName: text("business_name").notNull(),
    address: text("address"),
    city: text("city"),
    county: text("county"),
    zip: text("zip"),
    reportMonth: date("report_month").notNull(),
    totalReceipts: integer("total_receipts"),
    beerReceipts: integer("beer_receipts"),
    wineReceipts: integer("wine_receipts"),
    liquorReceipts: integer("liquor_receipts"),
    coverChargeReceipts: integer("cover_charge_receipts"),
    totalTax: integer("total_tax"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_revenue_license").on(table.licenseId),
    index("idx_revenue_city").on(table.city),
    index("idx_revenue_month").on(table.reportMonth),
  ]
);

// ============ RELATIONS ============

export const licensesRelations = relations(licenses, ({ many }) => ({
  violations: many(violations),
  revenue: many(revenue),
}));

export const violationsRelations = relations(violations, ({ one }) => ({
  license: one(licenses, {
    fields: [violations.licenseId],
    references: [licenses.id],
  }),
}));

export const revenueRelations = relations(revenue, ({ one }) => ({
  license: one(licenses, {
    fields: [revenue.licenseId],
    references: [licenses.id],
  }),
}));

// ============ ZOD SCHEMAS ============

export const insertLicenseSchema = createInsertSchema(licenses);
export const selectLicenseSchema = createSelectSchema(licenses);
export const insertViolationSchema = createInsertSchema(violations);
export const insertRevenueSchema = createInsertSchema(revenue);
