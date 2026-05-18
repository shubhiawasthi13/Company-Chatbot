import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function indexTheDocument(filePath) {
  try {
    // Load PDF
    const loader = new PDFLoader(filePath, {splitPages: false});

    // Extract documents/pages
    const doc = await loader.load();

    // Print extracted content
    console.log(doc[0].pageContent);
    const textSplitter = new RecursiveCharacterTextSplitter({
   chunkSize: 500,
  chunkOverlap: 100,
});

// Split text into chunks
const texts = await textSplitter.splitText(doc[0].pageContent);

console.log(texts);
console.log(texts.length);

   
  } catch (error) {
    console.error("Error loading PDF:", error);
  }
}