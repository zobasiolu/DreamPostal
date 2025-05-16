import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  timezone: varchar("timezone", { length: 50 }).notNull().default("UTC"),
  lastSleepAt: timestamp("last_sleep_at"),
});

export const postcards = pgTable("postcards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  audioHash: text("audio_hash").notNull(),
  imgURL: text("img_url").notNull(),
  caption: text("caption").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isPublic: integer("is_public").default(1),
  likes: integer("likes").default(0),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  fromId: integer("from_id").notNull(),
  toId: integer("to_id").notNull(),
  postcardId: integer("postcard_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  timezone: true,
});

export const insertPostcardSchema = createInsertSchema(postcards).pick({
  userId: true,
  audioHash: true,
  imgURL: true,
  caption: true,
  isPublic: true,
});

export const insertTradeSchema = createInsertSchema(trades).pick({
  fromId: true,
  toId: true,
  postcardId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPostcard = z.infer<typeof insertPostcardSchema>;
export type Postcard = typeof postcards.$inferSelect;

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;
