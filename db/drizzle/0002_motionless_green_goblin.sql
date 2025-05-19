ALTER TABLE "document_chunks" ADD COLUMN "embeddings" vector(1536);--> statement-breakpoint
ALTER TABLE "document_chunks" DROP COLUMN "embedding";