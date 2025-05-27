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
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { createClient } from "@supabase/supabase-js"
dotenv.config()

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

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

const client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

export async function initiateChatWithDocument(documentId: string) {
  const document = await getDocument(documentId)
  if (!document) {
    throw new Error("Document not found")
  }

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: "document_chunks", // Ensure this table stores your chunks and embeddings
    queryName: "match_documents", // This Supabase function should query 'document_chunks.embedding'
    // and ideally support filtering if not handled by the retriever's filter.
  })

  // Create a retriever that filters by the specific documentId.
  // Assumes 'document_id' is a column in your 'document_chunks' table.
  const retriever = vectorStore.asRetriever({
    filter: {
      document_id: documentId,
    },
    k: 10, // Keep fetching 10 relevant chunks
  })

  const outputParser = new StringOutputParser()
  const systemPrompt = `
You are DocChat, an expert AI assistant focused on delivering accurate, professional, and well-formatted answers strictly based on the provided document context.

GUIDELINES:
- Use information found in the CONTEXT below. You may add further elaboration but do not fabricate or go against the given context.
- If the answer is not present in the context, respond: "I dont see information about that in the document."
- Keep responses clear, concise, and professional. Define terms or concepts if they are relevant to the question yet are not explicitly mentioned in the document.
- Organize answers using markdown: use headings, bullet points, numbered lists, and paragraphs for readability.
- Do not include any metadata or extraneous information in your response.
- If asked for a summary, provide a succinct overview of the documents main points.
- If asked for a specific section, reproduce that section verbatim and clearly indicate it as such.
- If asked for a list of topics, provide a bullet-point list of the main topics covered in the document.
- If a question is outside the documents scope, politely redirect the user to ask about the document content.

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
  console.log(
    "Chain created successfully using existing vectors for document ID:",
    documentId
  )
  return chain
}
