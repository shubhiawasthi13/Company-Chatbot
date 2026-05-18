import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function indexTheDocument(filePath) {
  try {
    // Load PDF
    const loader = new PDFLoader(filePath, {splitPages: false});

    // Extract documents/pages
    const doc = await loader.load();

    // Print extracted content
    console.log(doc[0].pageContent);

   
  } catch (error) {
    console.error("Error loading PDF:", error);
  }
}