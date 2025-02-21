import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Load .env.local

import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
  console.error("❌ API Key not found. Check your .env.local file!");
  process.exit(1);
}

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY }); // No 'environment'

const indexName = process.env.PINECONE_INDEX_NAME;

async function checkPinecone() {
  try {
    const index = pinecone.index(indexName);
    const stats = await index.describeIndexStats();
    console.log("✅ Pinecone Index Stats:", stats);
  } catch (error) {
    console.error("❌ Error fetching Pinecone stats:", error);
  }
}

checkPinecone();
