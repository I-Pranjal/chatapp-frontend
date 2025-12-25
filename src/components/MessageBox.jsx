import React, { useState } from "react";
import { Paperclip, Send } from "lucide-react";

const API_BASE = "http://localhost:5003/api"; // adjust if deployed

export default function MessageBox({ chatId, onSendMessage }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;
    try {
      setLoading(true);
      // Delegate network send to parent (App.handleSendMessage)
      onSendMessage(input.trim());
      setInput("");
    } catch (err) {
      console.error("🚨 Error preparing message:", err);
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
