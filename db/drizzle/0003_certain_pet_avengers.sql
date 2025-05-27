ALTER TABLE "document_chunks" RENAME COLUMN "chunk_text" TO "content";--> statement-breakpoint
ALTER TABLE "document_chunks" DROP CONSTRAINT "document_chunks_document_id_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "document_chunks" ADD COLUMN "metadata" text NOT NULL;--> statement-breakpoint
ALTER TABLE "document_chunks" DROP COLUMN "document_id";--> statement-breakpoint
ALTER TABLE "document_chunks" DROP COLUMN "chunk_index";