import dotenv from "dotenv";
dotenv.config();

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

import { Pinecone } from "@pinecone-database/pinecone";

// Embedding Model
const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/all-MiniLM-L6-v2",
});

// Pinecone Client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

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

    const splitDocs = await textSplitter.createDocuments([docs[0].pageContent]);

    console.log("Chunks:", splitDocs.length);

    console.log("Creating embeddings...");

    // Generate embeddings
    const vectors = await embeddings.embedDocuments(
      splitDocs.map((doc) => doc.pageContent),
    );

    console.log("Vectors Created:", vectors.length);

    console.log("Vector Dimension:", vectors[0]?.length);

    console.log("Connecting to Pinecone...");

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

    console.log("Preparing records...");

    const records = splitDocs.map((doc, index) => ({
      id: `doc-${index}`,

      values: Array.from(vectors[index]),

      metadata: {
        text: doc.pageContent,
      },
    }));

    console.log("Total Records:", records.length);

    console.log("Uploading to Pinecone...");

    await pineconeIndex.upsert(records);

    console.log("Documents stored in Pinecone successfully");
  } catch (error) {
    console.error("Error:", error);
  }
}
