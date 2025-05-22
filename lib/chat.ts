import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai"
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables"
import { TaskType } from "@google/generative-ai"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"
import dotenv from "dotenv"
import { getDocumentChunks } from "./get-data"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import type { Document } from "@langchain/core/documents"

dotenv.config()

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: GOOGLE_API_KEY,
})
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  apiKey: GOOGLE_API_KEY,
})

export async function initiateChatWithDocument(documentId: string) {
  const chunks = await getDocumentChunks(documentId)
  const mappedChunks: Document[] = chunks.map((chunk) => ({
    pageContent: chunk.chunkText,
    metadata: { embedding: chunk.embedding },
  }))
  const vectorStore = new MemoryVectorStore(embeddings)
  await vectorStore.addDocuments(mappedChunks)

  const retriever = vectorStore.asRetriever()

  const outputParser = new StringOutputParser()
  const systemPrompt = `
- You are an assistant designed to assist users by providing information, if possible based on the context provided.
- You must not guess, provide information that is not explicitly mentioned, hallucinate or create answers.
- {context}
-     `
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "{input}"],
  ])

  const chain = RunnableSequence.from([
    {
      input: new RunnablePassthrough(),
      context: retriever.getRelevantDocuments.bind(retriever),
    },
    prompt,
    model,
    outputParser,
  ])
  console.log("Chain created successfully.")
  return chain
}
