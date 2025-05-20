import getRetriever from "./embedding"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables"
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"
import dotenv from "dotenv"
import { db } from "../db"
import { documents } from "@/db/schema"
import { eq } from "drizzle-orm"
dotenv.config()

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: GOOGLE_API_KEY,
})

async function initiateChatWithDocument(documentId: string) {
  if (!documentId) {
    throw new Error("Document ID is required")
  }
  const files = await db
    .select({ filePath: documents.filePath })
    .from(documents)
    .where(eq(documents.id, documentId))
  if (!files.length) {
    throw new Error("No document found for the provided ID")
  }
  const filePath = files[0].filePath
  const retriever = await getRetriever(filePath)
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
    { question: new RunnablePassthrough(), context: async () => retriever },
    prompt,
    model,
    outputParser,
  ])
  return chain
}
export async function chatWithDocument(documentId: string, question: string) {
  const chatChain = await initiateChatWithDocument(documentId)
  const response = await chatChain.invoke({ input: question })
  return response
}
