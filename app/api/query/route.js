import { Pinecone } from "@pinecone-database/pinecone";
import axios from "axios";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

const GEMINI_API_KEY = "AIzaSyCaG734rIXK93_ZVlfTHfINAXyd04iwBt8";
const GEMINI_EMBEDDING_URL = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
const GEMINI_CHAT_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "No query provided" }), { status: 400 });
    }

    // Generate embeddings using Gemini
    const geminiEmbeddingRes = await axios.post(
      GEMINI_EMBEDDING_URL,
      { content: { parts: [{ text: query }] } },
      { headers: { "Content-Type": "application/json" } }
    );

    const vector = geminiEmbeddingRes.data.embedding.values;
    if (!vector) {
      throw new Error("Invalid response from Gemini embedding API");
    }

    // Search Pinecone
    const searchResults = await index.query({
      vector,
      topK: 3,
      includeMetadata: true,
    });

    if (!searchResults.matches?.length) {
      return new Response(JSON.stringify({ response: "No relevant information found." }), { status: 200 });
    }

    // Extract relevant text
    const retrievedTexts = searchResults.matches.map((match) => match.metadata?.text || "").join("\n");

    // Ask Gemini for final response
    const geminiResponse = await axios.post(
      GEMINI_CHAT_URL,
      { contents: [{ parts: [{ text: `${retrievedTexts}\n\nUser Query: ${query}` }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    return new Response(JSON.stringify({ response: geminiResponse.data.candidates[0].content.parts[0].text }), { status: 200 });
  } catch (error) {
    console.error("Error in query request:", error.response?.data || error.message);
    return new Response(JSON.stringify({ error: "Failed to process query" }), { status: 500 });
  }
}
