import dotenv from "dotenv";
dotenv.config();

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

import { Pinecone } from "@pinecone-database/pinecone";

import { PineconeStore } from "@langchain/pinecone";

// Embedding Model
export const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/all-MiniLM-L6-v2",
});

// Pinecone Client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Pinecone Index
const pineconeIndex = pinecone.Index(
  process.env.PINECONE_INDEX
);

// Export Vector Store
export const vectorStore =
  await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex,
      maxConcurrency: 5,
    }
  );

export async function indexTheDocument(filePath) {
  try {
    console.log("Loading PDF...");

    // Load PDF
    const loader = new PDFLoader(filePath, {
      splitPages: false,
    });

    const docs = await loader.load();

    console.log("Splitting text...");

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

    const splitDocs =
      await textSplitter.createDocuments([
        docs[0].pageContent,
      ]);

    console.log("Chunks:", splitDocs.length);

    console.log(
      "Adding documents to Vector Store..."
    );

    // Store directly in Pinecone
    await vectorStore.addDocuments(splitDocs);

    console.log(
      "Documents stored in Pinecone successfully"
    );
  } catch (error) {
    console.error("Error:", error);
  }
}