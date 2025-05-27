import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"
import dotenv from "dotenv"
import { getDocument } from "./get-data"
import { vectorStore } from "./vector-store"
dotenv.config()

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: GOOGLE_API_KEY,
})

export async function initiateChatWithDocument(documentId: string) {
  const document = await getDocument(documentId)
  if (!document) {
    throw new Error("Document not found")
  }
  const retriever = vectorStore.asRetriever({
    filter: {
      document_id: documentId,
    },
    k: 10,
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
