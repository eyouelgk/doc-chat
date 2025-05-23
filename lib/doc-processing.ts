import { fromBuffer } from "file-type"
import { Document } from "langchain/document"
import { TaskType } from "@google/generative-ai"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx"
import { TextLoader } from "langchain/document_loaders/fs/text"
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

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        const docxBlob = new Blob([buffer], { type: mime })
        const docxloader = new DocxLoader(docxBlob, { type: "docx" })
        const docxText = await docxloader.load()
        return {
          pageContent: docxText.map((doc) => doc.pageContent).join("\n"),
          metadata: {},
        }
      case "application/x-cfb":
        console.log(mime)
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
        console.error(
          `Unsupported file type: ${fileType.ext} of ${fileType.mime}`
        )
        return { pageContent: "Unsupported file type", metadata: {} }
    }
  } else if (fileType === undefined && buffer) {
    const mime = "text/plain"
    const textBlob = new Blob([buffer], { type: mime })
    const textloader = new TextLoader(textBlob)
    const textDocs = await textloader.load()
    const mergedTextDoc = {
      pageContent: textDocs.map((doc) => doc.pageContent).join("\n"),
      metadata: {},
    }
    return mergedTextDoc
  } else {
    console.error("Unknown file type")
  }
  return { pageContent: "Unknown file type", metadata: {} }
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
