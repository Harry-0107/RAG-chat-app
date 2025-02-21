import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

const genAI = new GoogleGenerativeAI("AIzaSyCaG734rIXK93_ZVlfTHfINAXyd04iwBt8");
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Query is required" }, { status: 400 });

    //  Generate embedding for the user query
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const embeddingRes = await model.embedContent(query);
    const queryEmbedding = embeddingRes.embedding.values;

    // Search Pinecone for relevant documents
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    if (!searchResults.matches?.length) {
      return NextResponse.json({ response: "No relevant information found." });
    }

    // Extract relevant text
    const context = searchResults.matches.map((match) => match.metadata.text).join("\n");

    // Generate response using Gemini
    const chatModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await chatModel.generateContent(`Context: ${context}\n\nUser: ${query}`);

    const responseText =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't find relevant information.";

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}
