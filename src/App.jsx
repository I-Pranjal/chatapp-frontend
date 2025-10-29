import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import ChatWindow from "./components/chatWindow.jsx";
import Sidebar from "./components/Sidebar.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";
import LoginPage from "./pages/login.jsx";

const API_BASE = "http://localhost:5003/api"; // ✅ Adjust if deployed
const CURRENT_USER = {
  _id: "6901d9899976ace64f63d4ae",
  name: "Doctor Strange",
};

function AppInner() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch messages when activeId changes
  useEffect(() => {
    if (!activeId) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("⚠️ No auth token found in localStorage");
          return;
        }

        const res = await fetch(`${API_BASE}/chats/message/${activeId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log("📩 Fetched messages for chat:", activeId, data);

        // ✅ Find or create chat
        const formatted = {
          id: activeId,
          name: data[0]?.sender?.name === CURRENT_USER.name
            ? data[0]?.receiver?.name || "Unknown"
            : data[0]?.sender?.name || "Unknown",
          avatarColor: "#4B7BE5",
          messages: data.map((msg) => ({
            id: msg._id,
            text: msg.text,
            ts: msg.createdAt,
            fromMe: msg.sender._id === CURRENT_USER._id,
          })),
        };

        setConversations((prev) => {
          const exists = prev.find((c) => c.id === activeId);
          if (exists) {
            return prev.map((c) => (c.id === activeId ? formatted : c));
          }
          return [...prev, formatted];
        });
      } catch (err) {
        console.error("❌ Failed to load chat:", err);
      }
    };

    fetchMessages();
  }, [activeId]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  );

  // ✅ Send message dynamically
  async function handleSendMessage(text) {
    if (!text.trim() || !activeId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("⚠️ No auth token found in localStorage");
        return;
      }

      const res = await fetch(`${API_BASE}/chats/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: activeId,
          text: text.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const saved = await res.json();

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { id: saved._id, text: saved.text, ts: saved.createdAt, fromMe: true },
                ],
              }
            : c
        )
      );
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  }

  function filteredConversations() {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.lastMessage || "").toLowerCase().includes(q)
    );
  }

  function ChatRoute() {
    const { id } = useParams();
    useEffect(() => {
      if (id) setActiveId(id);
    }, [id]);

    const conv = conversations.find((c) => c.id === id) || active;
    if (!conv) return <div className="empty">No conversation found</div>;
    console.log("💬 Rendering chat for conversation:", conv);
    return <ChatWindow conversation={conv} onSend={handleSendMessage} />;
  }

  function ChatPage() {
    return (
      <div className="app-root">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          query={query}
          setQuery={setQuery}
          filteredConversations={filteredConversations()}
          activeId={active?.id}
          selectConversation={(id) => navigate(`/chat/${id}`)}
          addConversation={() => {}}
          totalCount={conversations.length}
        />

        <main className="main-area">
          <Routes>
            <Route path="/" element={<div className="empty">Select a chat to start</div>} />
            <Route path=":id" element={<ChatRoute />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="home">
            <h1>Welcome</h1>
            <nav style={{ display: "flex", gap: 12 }}>
              <Link to="/login">Login Page</Link>
              <Link to="/chat">Chat Page</Link>
            </nav>
          </div>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/chat/*" element={<ChatPage />} />
      <Route path="*" element={<div className="empty">Page not found</div>} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}
