import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { createClient } from "@supabase/supabase-js"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { TaskType } from "@google/generative-ai"
import { parseDocumentFromUrl } from "./doc-processing"
import { splitText } from "./doc-processing"
import dotenv from "dotenv"

dotenv.config()

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  apiKey: GOOGLE_API_KEY,
})
const supabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabaseClient,
  tableName: "document_chunks",
  queryName: "match_documents",
})

export async function generateVectorStore(
  documentId: string,
  url: string
): Promise<SupabaseVectorStore> {
  if (!url) {
    throw new Error("No Document URL provided")
  }
  const documentContent = await parseDocumentFromUrl(url)
  const chunks = await splitText(documentContent)
  if (chunks.length === 0) {
    throw new Error("No valid document chunks found")
  }
  const id = [documentId]
  await vectorStore.addDocuments(chunks, { ids: id })
  if (chunks.length > 0 || !vectorStore) {
    throw new Error("Vector store is not initialized")
  }
  return vectorStore
}
