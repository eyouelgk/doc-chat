import { Document } from "langchain/document"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { TaskType } from "@google/generative-ai"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import dotenv from "dotenv"
import { extractText, getDocumentProxy } from "unpdf"
import { fromBuffer } from "file-type"
import mammoth from "mammoth"
dotenv.config()

export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  apiKey: process.env.GOOGLE_API_KEY,
})

export async function parseDocumentFromUrl(url: string) {
  const buffer = await fetch(url).then((res) => res.arrayBuffer())
  const uint8Array = new Uint8Array(buffer)
  const fileType = await fromBuffer(uint8Array)
  if (fileType) {
    const mime = fileType.mime as string
    switch (mime) {
      case "application/pdf":
        const pdf = await getDocumentProxy(uint8Array)
        const { totalPages, text } = await extractText(pdf, {
          mergePages: true,
        })
        console.log("Total pages:", totalPages)
        return text
      case "text/plain":
      case "text/html":
      case "text/markdown":
        const textText = new TextDecoder("utf-8").decode(uint8Array)
        console.log("Text length:", textText.length)
        return textText

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const docText = await mammoth
          .extractRawText({ buffer: Buffer.from(buffer) })
          .then((result) => {
            return result.value
          })
        console.log("Word document length:", docText.length)
        return docText
      default:
        console.error(`Unsupported file type: ${fileType.ext}`)
        return "Unsupported file type"
    }
  } else {
    console.error("Unknown file type")
    return "Unknown file type"
  }
}

export async function splitText(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 500,
  })
  const chunks = await splitter.splitText(text)
  console.log("Chunks:", chunks.length)
  return chunks.map(
    (chunk) => new Document({ pageContent: chunk, metadata: {} })
  )
}

async function generateEmbeddings(chunks: Document[]) {
  const texts = chunks.map((chunk) => chunk.pageContent)
  const embeddingsVectors = await embeddings.embedDocuments(texts)
  console.log("Embeddings:", embeddingsVectors.length, "Chunks:", chunks.length)
  return chunks.map((chunk, index) => ({
    chunkText: chunk.pageContent,
    chunkIndex: index,
    embedding: embeddingsVectors[index],
  }))
}
export default async function chunksAndEmbeddings(url: string) {
  const text = await parseDocumentFromUrl(url)
  const chunks = await splitText(text)
  const embeddings = await generateEmbeddings(chunks)
  return embeddings
}
