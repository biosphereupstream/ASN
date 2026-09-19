import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core'

/**
 * Data model per PRD §12. Money is integer IDR; timestamps are timestamptz.
 */
export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  province: text('province').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const districts = pgTable('districts', {
  id: serial('id').primaryKey(),
  cityId: integer('city_id')
    .notNull()
    .references(() => cities.id),
  name: text('name').notNull(),
  slug: text('slug').notNull()
})

export const coverageAreas = pgTable(
  'coverage_areas',
  {
    id: serial('id').primaryKey(),
    cityId: integer('city_id')
      .notNull()
      .references(() => cities.id),
    districtId: integer('district_id')
      .notNull()
      .references(() => districts.id),
    status: text('status', { enum: ['available', 'coming_soon', 'not_available'] }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    updatedBy: integer('updated_by').references(() => adminUsers.id)
  },
  (t) => [uniqueIndex('coverage_city_district_uq').on(t.cityId, t.districtId)]
)

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  key: text('key', { enum: ['fiber', 'stream', 'mesh', 'business'] }).notNull().unique(),
  name: text('name').notNull(),
  tagline: text('tagline').notNull(),
  heroCopy: text('hero_copy').notNull().default(''),
  features: jsonb('features').$type<string[]>().notNull().default([]),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true)
})

export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  speedMbps: integer('speed_mbps').notNull(),
  basePriceIdr: integer('base_price_idr').notNull(),
  devicesMin: integer('devices_min').notNull(),
  devicesMax: integer('devices_max').notNull(),
  features: jsonb('features').$type<string[]>().notNull().default([]),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true)
})

export const packageAreaPrices = pgTable('package_area_prices', {
  id: serial('id').primaryKey(),
  packageId: integer('package_id')
    .notNull()
    .references(() => packages.id),
  cityId: integer('city_id')
    .notNull()
    .references(() => cities.id),
  districtId: integer('district_id').references(() => districts.id),
  priceIdr: integer('price_idr').notNull(),
  isActive: boolean('is_active').notNull().default(true)
})

export const promos = pgTable('promos', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  badgeText: text('badge_text').notNull(),
  description: text('description').notNull(),
  tnc: text('tnc').notNull().default(''),
  discountType: text('discount_type', { enum: ['percent', 'fixed', 'free_months'] }).notNull(),
  discountValue: integer('discount_value').notNull(),
  scope: jsonb('scope').$type<{ products?: string[]; packages?: string[]; cities?: string[] }>().notNull().default({}),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').notNull().default(true)
})

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  cityId: integer('city_id')
    .notNull()
    .references(() => cities.id),
  districtId: integer('district_id')
    .notNull()
    .references(() => districts.id),
  address: text('address').notNull(),
  packageId: integer('package_id').references(() => packages.id),
  preferredDate: text('preferred_date'),
  source: text('source', {
    enum: ['homepage_checker', 'package_card', 'product_page', 'promo_page', 'contact_page', 'waitlist']
  }).notNull(),
  status: text('status', { enum: ['new', 'contacted', 'scheduled', 'installed', 'lost'] })
    .notNull()
    .default('new'),
  duplicateOf: integer('duplicate_of'),
  notes: text('notes').notNull().default(''),
  consentAt: timestamp('consent_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const areaRequests = pgTable('area_requests', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  cityId: integer('city_id')
    .notNull()
    .references(() => cities.id),
  districtId: integer('district_id')
    .notNull()
    .references(() => districts.id),
  notifyWhenAvailable: boolean('notify_when_available').notNull().default(false),
  status: text('status', { enum: ['new', 'reviewed'] }).notNull().default('new'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const contentBlocks = pgTable('content_blocks', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: integer('updated_by').references(() => adminUsers.id)
})

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'marketing', 'sales', 'noc'] }).notNull().default('admin'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true })
})

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').references(() => adminUsers.id),
  entity: text('entity').notNull(),
  entityId: integer('entity_id'),
  action: text('action').notNull(),
  diff: jsonb('diff').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})
