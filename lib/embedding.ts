import { Document } from "langchain/document"
import { parseDocumentFromUrl, splitText } from "./doc-processing"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { TaskType } from "@google/generative-ai"
import { db } from "../db"
import { documentChunks } from "../db/schema"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { eq } from "drizzle-orm"
import { documents } from "../db/schema"

require("dotenv").config()

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
interface DocumentChunk {
  documentId: string
  chunkText: string
  chunkIndex: number
  embedding: number[] // 1536 dimensions vector
}
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  apiKey: GOOGLE_API_KEY,
})

async function isDocumentInDatabase(filePath: string) {
  const [documentRecord] = await db
    .select({ id: documents.id })
    .from(documents)
    .where(eq(documents.filePath, filePath))

  if (!documentRecord) {
    throw new Error(`Document not found for ${filePath}`)
  }
  const documentId = documentRecord.id

  return { exists: !!documentRecord, id: documentRecord?.id }
}
export default async function getRetriever(filePath: string) {
  const { exists: documentExists, id: documentId } = await isDocumentInDatabase(
    filePath
  )
  if (!documentExists) {
    const text = await parseDocumentFromUrl(filePath)
    const chunks = await splitText(text)
    const embeddingsVectors = await embedChunks(chunks)
    await saveChunksToDatabase(chunks, embeddingsVectors, filePath)
  }
  const chunksFromDatabase = await getChunksFromDatabase(documentId)
  if (!chunksFromDatabase) {
    console.error("Failed to fetch chunks from database.")
    return null
  }
  const retriever = await generateRetriever(chunksFromDatabase)
  if (!retriever) {
    console.error("Failed to generate retriever.")
  }
  return retriever
}

async function embedChunks(chunks: Document[]) {
  const texts = chunks.map((chunk) => chunk.pageContent)
  const embeddingsVectors = await embeddings.embedDocuments(texts)
  return embeddingsVectors
}

async function saveChunksToDatabase(
  chunks: Document[],
  embeddingsVectors: any[],
  filePath: string
) {
  const documentRecord = await (db as any)
    .select("id")
    .from("documents")
    .where("filePath", "=", filePath)
    .executeTakeFirst()

  if (!documentRecord) {
    throw new Error(`Document not found for ${filePath}`)
  }
  const documentId = documentRecord.id

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const vectorEntry = {
      documentId,
      chunkText: chunks[chunkIndex].pageContent,
      chunkIndex,
      embedding: embeddingsVectors[chunkIndex],
    }
    await db.insert(documentChunks).values(vectorEntry)
  }

  console.log("Saved chunks to database.")
  return documentId
}
async function getChunksFromDatabase(documentId: string) {
  const chunkFetcher = await db
    .select()
    .from(documentChunks)
    .where(eq(documentChunks.documentId, documentId))

  if (!chunkFetcher) {
    throw new Error(`Retriever not found for document ID ${documentId}`)
  }
  console.log("Fetched chunks from database.")

  const chunksFromDatabase = chunkFetcher.map((chunk: any) => ({
    documentId: chunk.documentId,
    chunkText: chunk.chunkText,
    chunkIndex: chunk.chunkIndex,
    embedding: chunk.embedding,
  }))
  return chunksFromDatabase
}

async function generateRetriever(chunksFromDatabase: DocumentChunk[]) {
  const vectorStore = await MemoryVectorStore.fromDocuments(
    chunksFromDatabase.map(
      (chunk) => new Document({ pageContent: chunk.chunkText })
    ),
    embeddings
  )
  const retriever = vectorStore.asRetriever()
  console.log("Generated retriever.")
  return retriever
}
