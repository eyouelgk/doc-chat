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
import { getDocument } from "./get-data"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { parseDocumentFromUrl, splitText } from "./doc-processing"
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
  const document = await getDocument(documentId)
  if (!document) {
    throw new Error("Document not found")
  }
  const filePath = document.filePath
  const text = await parseDocumentFromUrl(filePath)
  const chunks = await splitText(text)

  const vectorStore = new MemoryVectorStore(embeddings)
  await vectorStore.addDocuments(chunks)

  const retriever = vectorStore.asRetriever(10)

  const outputParser = new StringOutputParser()
  const systemPrompt = `
You are DocChat, an AI assistant specialized in providing information from documents.

RULES:
- Always base your answers on the provided document context.
- If the answer is not in the context, say "I don't see information about that in the document."
- Never make up information or hallucinate facts.
- Keep responses concise and focused on the user's question.
- When quoting from the document, use quotation marks and indicate the source.
- If asked about something outside the document's scope, politely redirect to the document content.
- Format your responses for readability with paragraphs and bullet points when appropriate.
- dont add metadata to the answer.
- If the user asks for a summary, provide a brief overview of the document's main points.
- If the user asks for a specific section, provide that section verbatim.
- If the user asks for a list of topics covered, provide a bullet-point list of the main topics.
- Output should be in markdown format.
CONTEXT:
{context}
`
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
