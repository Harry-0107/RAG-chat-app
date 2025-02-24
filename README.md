# RAG Chat Application with URL Scraping

This project implements a Retrieval-Augmented Generation (RAG) chat application using Google Gemini, designed to scrape content from user-provided URLs and use it as a knowledge base for a chatbot.

## Features

-   **URL Input:** Users can input one or more URLs through a web interface.
-   **Content Scraping:** The application scrapes and extracts meaningful text content from the provided URLs.
-   **Vector Embeddings:** Scraped content is converted into vector embeddings for efficient retrieval.
-   **Vector Database:** Embeddings are stored in a vector database (Pinecone).
-   **RAG Chatbot:** Google Gemini is integrated to provide RAG-based responses to user queries, utilizing the scraped content.

## Tech Stack

-   **Frontend:** Next.js (App Router)
-   **Backend:** Next.js API routes
-   **Vector Database:** Pinecone
-   **Embedding API:** Google Gemini embedding API
-   **LLM:** Google Gemini API
-   **Scraping:** Axios / puppeteer
-   **Version Control:** Git & Github
-   **Deployment:** Vercel

## Local Setup Guide

1.  **Clone the Repository:**

    ```terminal
    git clone [Your Repository URL]
    cd [Project Directory]
    ```

2.  **Install Dependencies:**

    ```terminal
    npm install
    ```

3.  **Set Environment Variables:**

    Create a `.env.local` file in the root directory and add the following environment variables:

    ```
    PINECONE_API_KEY=your_pinecone_api_key
    PINECONE_INDEX_NAME=your_pinecone_index_name
    GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
    ```

    Replace the placeholders with your actual API keys and index name.

4.  **Run the Application:**

    ```terminal
    npm run dev
    ```

    The application will be accessible at `http://localhost:3000`.

## Deployment

The application is deployed on Vercel.

-   **Live Demo Link:** rag-chat-app-weld.vercel.app
 

## Usage

1.  Open the web application in your browser.
2.  Enter one or more URLs into the input field.
     - my personal suggestions would be, 
       - https://example.com (ask what is the example domain)
       - https://bbc.com/news (ask for current live news)
       - https://en.wikipedia.org/wiki/Artificial_intelligence (ask what AI is)
       - and any other website you would like to scrape and know about.
3.  Click the "Add URL" button to process the URLs.
4.  Use the chat interface to ask questions related to the scraped content.

## Assumptions and Limitations

-   The application assumes that the provided URLs contain readable text content.
-   Error handling for URL scraping and API requests is implemented but you may face errors when the website you're trying to scrape is too dynamic and heavily relaiant on JS.
-   Gemini API may just hit the Quota limit.
-   The scraping functionality works just fine but improvements to handle complex web pages and different content types can be made.

## Comments about the Issues I faced while working on this project

1. Switching from FAISS to Pinecone
- Initially tried FAISS (Facebook AI Similarity Search) but faced compatibility issues and native binding errors.
- FAISS is optimized for local use but not ideal for cloud deployment.
- Switched to Pinecone, which worked after some code restructuring.
  
2. Vector Dimension Mismatch
- Initially set Pinecone to 384D, but the embedding model required 512D, so Recreated a new Vector Database as pinecone doesnt allow us to change Dimensions once created.
- Later, after integrating Gemini API, realized it outputs 768D, requiring the need to recreate the VD again.
  
3. Universal Sentence Encoder (USE) Issues
- USE provides 512D embeddings, while Gemini and Pinecone required 768D.
- Considered resizing USE embeddings by padding with zeros, which preserved meaning but was a workaround.
- Eventually dropped USE entirely and switched to Gemini for Embeddings, improving performance, compatibility, and simplicity.

4. Web Scraping Limitations
- Basic static websites (e.g., example.com) worked fine, but dynamic sites (e.g., BBC News) broke the scraper.
- The issue was caused by JavaScript-heavy content that Axios couldn't handle.
- Switched to Puppeteer, a headless browser that can render dynamic content properly.
  
5. API Overload & Data Truncation
- Large text data caused API slowdowns and exceeded limits.
- Implemented text truncation to avoid performance issues and reduce token consumption.
  
6. Frontend and Backend Integration Issues
- At first, the frontend wasn’t properly connected to Pinecone, leading to query failures.
- similarly, the backend wasn't properly communicating with pinecone and Gemini API to facilitate everything.
- took a bit of time to properly debug line by line but was able to fix everything.

7. Issues during Deployment. 
- Vercel didn't support Puppeteer as it was missing "Chrome for Puppeteer", and it doesn't support running a full chrome browser.
- so i had to switch to Playwright as it works better in serverless environments like vercel.
- playwright actually needed more space for all its browser installations (around 500+mb) but vercel only offered 250mb for the serverless environment.
- so i switched back to puppeteer-core but which only includes the essential functions along with a lightweight headless chromium browser to perform the scraping.
