import { fromBuffer } from "file-type"
import { Document } from "langchain/document"
import { TaskType } from "@google/generative-ai"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx"
import { TextLoader } from "langchain/document_loaders/fs/text"
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv"
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx"
import dotenv from "dotenv"
dotenv.config()

export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  apiKey: process.env.GOOGLE_API_KEY,
})

export async function parseDocumentFromUrl(url: string): Promise<Document> {
  const buffer = await fetch(url).then((res) => res.arrayBuffer())
  const uint8Array = new Uint8Array(buffer)
  const fileType = await fromBuffer(uint8Array)
  if (fileType) {
    const mime = fileType.mime as string
    switch (mime) {
      case "application/pdf":
        const pdfBlob = new Blob([buffer], { type: mime })
        const pdfloader = new PDFLoader(pdfBlob, { splitPages: false })
        const pdfDoc = await pdfloader.load()
        console.log("Total pages:", pdfDoc.length)
        const mergedDoc = {
          pageContent: pdfDoc.map((doc) => doc.pageContent).join("\n"),
          metadata: {},
        }
        return mergedDoc
      case "text/plain":
      case "text/html":
      case "text/markdown":
        const textBlob = new Blob([buffer], { type: mime })
        const textloader = new TextLoader(textBlob)
        const textDocs = await textloader.load()
        const mergedTextDoc = {
          pageContent: textDocs.map((doc) => doc.pageContent).join("\n"),
          metadata: {},
        }
        return mergedTextDoc
      case "text/csv":
        const csvBlob = new Blob([buffer], { type: mime })
        const csvloader = new CSVLoader(csvBlob)
        const csvText = await csvloader.load()
        const mergedCsvDoc = {
          pageContent: csvText.map((doc) => doc.pageContent).join("\n"),
          metadata: {},
        }
        return mergedCsvDoc
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const docxBlob = new Blob([buffer], { type: mime })
        const docxloader = new DocxLoader(docxBlob, { type: "docx" })
        const docxText = await docxloader.load()
        return {
          pageContent: docxText.map((doc) => doc.pageContent).join("\n"),
          metadata: {},
        }
      case "application/msword":
        const docBlob = new Blob([buffer], { type: mime })
        const docloader = new DocxLoader(docBlob, { type: "doc" })
        const docText = await docloader.load()
        return {
          pageContent: docText.map((doc) => doc.pageContent).join("\n"),
          metadata: {},
        }
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        const pptxBlob = new Blob([buffer], { type: mime })
        const pptxloader = new PPTXLoader(pptxBlob)
        const pptxText = await pptxloader.load()
        return {
          pageContent: pptxText.map((doc) => doc.pageContent).join("\n"),
          metadata: {},
        }
      default:
        console.error(`Unsupported file type: ${fileType.ext}`)
        return { pageContent: "Unsupported file type", metadata: {} }
    }
  } else {
    console.error("Unknown file type")
    return { pageContent: "Unknown file type", metadata: {} }
  }
}

export async function splitText(document: Document) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 500,
  })
  const chunks = await splitter.splitDocuments([document])
  console.log("Chunks:", chunks.length)
  return chunks
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
  const document = await parseDocumentFromUrl(url)
  const chunks = await splitText(document)
  const embeddings = await generateEmbeddings(chunks)
  return embeddings
}
