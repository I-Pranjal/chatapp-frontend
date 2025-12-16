import React, { useState } from "react";
import { Paperclip, Send } from "lucide-react";

const API_BASE = "http://localhost:5003/api"; // adjust if deployed

export default function MessageBox({ chatId, onSendMessage }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const token = localStorage.getItem("token");
    
    // If no token or chatId is a sample ID, just use local state
    if (!token || chatId.startsWith('sample-')) {
      onSendMessage({
        id: `msg-${Date.now()}`,
        text: input.trim(),
        ts: new Date().toISOString(),
        fromMe: true,
      });
      setInput("");
      return;
    }

    try {
      setLoading(true);

      // ✅ Updated endpoint and request body to match backend
      const res = await fetch(`${API_BASE}/chats/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          // Provide profile user id so backend can authorize against chat membership
          "x-profile-user-id": localStorage.getItem("userProfileId") || localStorage.getItem("userId"),
        },
        body: JSON.stringify({
          chatId, // must match backend
          text: input,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to send message: ${errorText}`);
      }

      const newMsg = await res.json();

      // ✅ Notify parent to update message list immediately
      onSendMessage({
        id: newMsg._id,
        text: newMsg.text,
        ts: newMsg.createdAt,
        fromMe: true,
      });

      setInput("");
    } catch (err) {
      console.error("🚨 Error sending message:", err);
      // Fallback to local state if API fails
      onSendMessage({
        id: `msg-${Date.now()}`,
        text: input.trim(),
        ts: new Date().toISOString(),
        fromMe: true,
      });
      setInput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="composer" onSubmit={handleSend}>
      <button 
        type="button" 
        className="attach"
        aria-label="Attach file"
      >
        <Paperclip size={18} />
      </button>
      <input
        aria-label="Type a message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        disabled={loading}
      />
      <button 
        type="submit" 
        className="send" 
        disabled={loading}
        aria-label="Send message"
      >
        {loading ? "..." : <Send size={18} />}
      </button>
    </form>
  );
}
