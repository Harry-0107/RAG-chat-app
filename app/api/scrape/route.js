// import puppeteer from "puppeteer";
// import { Pinecone } from "@pinecone-database/pinecone";

// const GEMINI_API_KEY = "AIzaSyCaG734rIXK93_ZVlfTHfINAXyd04iwBt8";
// const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
// const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     console.log("Received request body:", body);

//     const { textContent } = body;
//     if (!textContent) {
//       return new Response(JSON.stringify({ error: "No URL provided" }), { status: 400 });
//     }

//     // Launch Puppeteer
//     const browser = await puppeteer.launch({ headless: "new" });
//     const page = await browser.newPage();
//     await page.goto(textContent, { waitUntil: "domcontentloaded" });

//     // Extract visible text
//     let extractedText = await page.evaluate(() => document.body.innerText);
//     await browser.close(); // Close Puppeteer

//     if (!extractedText) {
//       return new Response(JSON.stringify({ error: "Failed to extract text from the webpage" }), { status: 500 });
//     }

//     // **Limit the text to first 1000 characters**
//     extractedText = extractedText.substring(0, 1000);
//     console.log("Extracted Text:", extractedText);

//     // Get 768D embedding from Gemini API
//     const embeddingResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ content: { parts: [{ text: extractedText }] } }),
//     });

//     const embeddingData = await embeddingResponse.json();

//     if (!embeddingData.embedding || !embeddingData.embedding.values) {
//       return new Response(JSON.stringify({ error: "Failed to generate embeddings from Gemini" }), { status: 500 });
//     }

//     const vector = embeddingData.embedding.values;

//     if (!vector || vector.length !== 768 || vector.every(v => v === 0)) {
//       console.error("Invalid embedding received!");
//       return new Response(JSON.stringify({ error: "Invalid embedding data received from Gemini" }), { status: 500 });
//     }

//     // Store in Pinecone
//     const id = `doc-${Date.now()}`;
//     await index.upsert([{ id, values: vector, metadata: { text: extractedText } }]);

//     return new Response(JSON.stringify({ message: "Content stored in Pinecone", content: extractedText }), { status: 200 });

//   } catch (error) {
//     console.error("Error in request:", error);
//     return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
//   }
// }

import { chromium } from "playwright";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    const { textContent } = body;
    if (!textContent) {
      return new Response(JSON.stringify({ error: "No URL provided" }), { status: 400 });
    }
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(textContent, { waitUntil: "domcontentloaded" });

    // Extract visible text
    let extractedText = await page.evaluate(() => document.body.innerText);
    await browser.close(); // Close browser instance

    if (!extractedText) {
      return new Response(JSON.stringify({ error: "Failed to extract text from the webpage" }), { status: 500 });
    }

    extractedText = extractedText.substring(0, 1000);
    console.log("Extracted Text:", extractedText);

    return new Response(JSON.stringify({ message: "Scraped successfully", content: extractedText }), { status: 200 });

  } catch (error) {
    console.error("Error in request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
}
