import { users, documents, documentChunks, conversations, messages } from "@/db/schema";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";


// Types 


export type SelectUser = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export type SelectDocument = InferSelectModel<typeof documents>;
export type InsertDocument = InferInsertModel<typeof documents>;

export type SelectDocumentChunk = InferSelectModel<typeof documentChunks>;
export type InsertDocumentChunk = InferInsertModel<typeof documentChunks>;

export type SelectConversation = InferSelectModel<typeof conversations>;
export type InsertConversation = InferInsertModel<typeof conversations>;

export type SelectMessage = InferSelectModel<typeof messages>;
export type InsertMessage = InferInsertModel<typeof messages>;
