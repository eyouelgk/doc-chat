import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
  integer,
  pgEnum,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "admin",
  "assistant",
])

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  hashedPassword: text("hashed_password").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  role: messageRoleEnum("role").notNull().default("user"),
})

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  chunkText: text("chunk_text").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: vector("embeddings", { dimensions: 768 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").references(() => documents.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  conversations: many(conversations),
}))

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  chunks: many(documentChunks),
  conversations: many(conversations),
}))

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}))

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversations.userId],
      references: [users.id],
    }),
    document: one(documents, {
      fields: [conversations.documentId],
      references: [documents.id],
    }),
    messages: many(messages),
  })
)

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}))
