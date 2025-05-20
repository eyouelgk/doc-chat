import fs from "fs"
import path from "path"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import mammoth from "mammoth"
import { marked } from "marked"
import csv from "csv-parser"
import xlsx from "xlsx"
import { execSync } from "child_process"
import epub from "epub"
import fetch from "node-fetch"
import { Document } from "langchain/document"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

const codeExtensions = [
  ".py",
  ".js",
  ".java",
  ".cpp",
  ".c",
  ".cs",
  ".rb",
  ".php",
  ".html",
  ".css",
  ".xml",
  ".json",
  ".yaml",
  ".yml",
  ".ts",
  ".swift",
  ".go",
  ".rs",
  ".kt",
  ".m",
  ".sh",
  ".bat",
  ".r",
  ".pl",
  ".lua",
  ".sql",
  ".scala",
  ".vb",
  ".vbs",
  ".ps1",
]

async function parseText(filePath: string) {
  return fs.promises.readFile(filePath, "utf-8")
}
async function parsePdf(filePath: string): Promise<string> {
  try {
    const buffer = await fs.promises.readFile(filePath)
    const pdfBlob = new Blob([new Uint8Array(buffer)], {
      type: "application/pdf",
    })
    const loader = new PDFLoader(pdfBlob, {})
    const docs = await loader.load()
    return docs.map((doc) => doc.pageContent).join("\n")
  } catch (error) {
    console.error("Error parsing PDF:", error)
    return ""
  }
}
async function parseDocx(filePath: string) {
  try {
    const result = await mammoth.extractRawText({ path: filePath })
    return result.value
  } catch (error) {
    console.error("Error parsing DOCX:", error)
    return ""
  }
}
async function parseDoc(filePath: string) {
  try {
    const outputPath = filePath.replace(".doc", ".docx")
    execSync(`soffice --headless --convert-to docx "${filePath}"`)
    return await parseDocx(outputPath)
  } catch (error: any) {
    console.error("Error parsing DOC:", error)
    return error.message
  }
}
function parseMarkdown(filePath: string) {
  return fs.promises
    .readFile(filePath, "utf-8")
    .then((text) => marked.parse(text))
}
function parseCsv(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const results: string[] = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(JSON.stringify(data)))
      .on("end", () => resolve(results.join("\n")))
      .on("error", reject)
  })
}
async function parsePpt(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const outputPath = filePath.replace(/\.pptx?$/, ".txt")
    execSync(
      `soffice --headless --convert-to txt:"Text (encoded):UTF8" "${filePath}"`
    )
    fs.promises
      .readFile(outputPath, "utf-8")
      .then((text) => resolve(text))
      .catch(reject)
  })
}
async function parseExcel(filePath: string) {
  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  return xlsx.utils.sheet_to_csv(worksheet)
}
function isCodeFile(filePath: string) {
  const ext = path.extname(filePath).toLowerCase()
  return codeExtensions.includes(ext)
}
async function parseEpub(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    const book = new epub(filePath)
    let textData: string[] = []

    book.on("end", () => {
      book.flow.forEach((chapter) => {
        textData.push(chapter.toString())
      })
      resolve(textData.join("\n"))
    })

    book.on("error", reject)
    book.parse()
  })
}
function isUrl(url: string) {
  return /^https?:\/\//i.test(url)
}
async function downloadToTemp(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`)
  const ext = path.extname(url.split("?")[0]) || ".tmp"
  const tempPath = path.join(
    process.env.TEMP || process.env.TMPDIR || ".",
    `docu-chat-${Date.now()}${ext}`
  )
  const fileStream = fs.createWriteStream(tempPath)
  await new Promise<void>((resolve, reject) => {
    res.body.pipe(fileStream)
    res.body.on("error", reject)
    fileStream.on("finish", () => resolve(undefined))
  })
  return tempPath
}

type ParserFunction = (filePath: string) => Promise<string>

export async function parseDocumentFromUrl(
  urlFilePath: string
): Promise<string> {
  let localPath = urlFilePath
  let tempDownloaded = false
  if (isUrl(urlFilePath)) {
    localPath = await downloadToTemp(urlFilePath)
    tempDownloaded = true
  }
  if (!fs.existsSync(localPath)) {
    throw new Error("File does not exist")
  }
  const parsers: { [key: string]: ParserFunction } = {
    ".pdf": parsePdf,
    ".docx": parseDocx,
    ".doc": parseDoc,
    ".md": parseMarkdown,
    ".csv": parseCsv,
    ".xls": parseExcel,
    ".xlsx": parseExcel,
    ".pptx": parsePpt,
    ".epub": parseEpub,
  }

  if (isCodeFile(localPath)) {
    const result = await parseText(localPath)
    if (tempDownloaded) fs.unlinkSync(localPath)
    return result
  }

  const ext = path.extname(localPath).toLowerCase()
  const parser = parsers[ext] || parseText
  const result = await parser(localPath)
  if (tempDownloaded) fs.unlinkSync(localPath)
  return result
}
export async function splitText(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 500,
  })
  const chunks = await splitter.splitText(text)
  return chunks.map((chunk) => new Document({ pageContent: chunk }))
}
