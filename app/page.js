"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);

  const addUrl = async () => {
    if (!url) return;

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textContent: url }),
      });

      const data = await response.json();
      if (data.content) {
        setUrls([...urls, { url, content: data.content }]);
      } else {
        console.error("No content received");
      }
    } catch (error) {
      console.error("Error adding URL:", error);
    }

    setUrl("");
  };

  const sendMessage = async () => {
    if (!chatInput) return;
    setMessages([...messages, { role: "user", content: chatInput }]);
    setChatInput("");

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: chatInput }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      const data = await response.json();

      console.log("API Response:", data); // Debugging log

      setMessages((prev) => [
        ...prev,
        { role: "bot", content: data?.response || "No response received" },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <main style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>RAG Chat App</h1>

      {/* URL Input Section */}
      <div>
        <input
          type="text"
          placeholder="Enter a URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "70%", padding: "8px", color: "#333" }}
        />
        <button onClick={addUrl} style={{ padding: "8px", marginLeft: "10px" }}>
          Add URL
        </button>
      </div>
      <ul>
        {urls.map((u, index) => (
          <li key={index}>
            <strong>{u.url}</strong>
            <p>{u.content.substring(0, 100)}...</p>
          </li>
        ))}
      </ul>

      {/* Chat Section */}
      <div style={{ marginTop: "20px" }}>
        <h2>Chat</h2>
        <div style={{ border: "1px solid #ccc", padding: "10px", height: "200px", overflowY: "auto" }}>
          {messages.map((msg, index) => (
            <p key={index} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
              <strong>{msg.role === "user" ? "You" : "Bot"}:</strong> {msg.content}
            </p>
          ))}
        </div>
        <input
          type="text"
          placeholder="Ask something..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          style={{ width: "70%", padding: "8px", marginTop: "10px", color: "#333" }}
        />
        <button onClick={sendMessage} style={{ padding: "8px", marginLeft: "10px" }}>
          Send
        </button>
      </div>
    </main>
  );
}
