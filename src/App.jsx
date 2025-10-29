import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import ChatWindow from "./components/ChatWindow.jsx";
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

const API_BASE = "http://localhost:5003/api"; // 🔧 adjust if deployed
const DEFAULT_CHAT_ID = "690245f2098a59a3f7d1d47d";
const CURRENT_USER = {
  _id: "6901d9899976ace64f63d4ae",
  name: "Doctor strange",
};

function AppInner() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(DEFAULT_CHAT_ID);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // ✅ Load chat messages for the default chat
useEffect(() => {
  const fetchMessages = async () => {
    try {
      // ✅ Get token from localStorage
      const token = localStorage.getItem("token");

      // ✅ Check if token exists
      if (!token) {
        console.error("⚠️ No auth token found in localStorage");
        return;
      }

      // ✅ Fetch messages with Authorization header
      const res = await fetch(`${API_BASE}/chats/message/${DEFAULT_CHAT_ID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Attach token here
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("📩 Fetched messages:", data);

      const formatted = {
        id: DEFAULT_CHAT_ID,
        name: "रघु",
        avatarColor: "#4B7BE5",
        messages: data.map((msg) => ({
          id: msg._id,
          text: msg.text,
          ts: msg.createdAt,
          fromMe: msg.sender._id === CURRENT_USER._id,
        })),
      };

      setConversations([formatted]);
    } catch (err) {
      console.error("❌ Failed to load chat:", err);
    }
  };

  fetchMessages();
}, []);


  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) || conversations[0] || null,
    [conversations, activeId]
  );

  useEffect(() => {
    if (!active && conversations.length) setActiveId(conversations[0].id);
  }, [active, conversations]);

  // ✅ Send message to backend
  async function handleSendMessage(text) {
    if (!text.trim() || !active) return;

    const newMsg = {
      chatId: DEFAULT_CHAT_ID,
      sender: CURRENT_USER._id,
      text: text.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });

      const saved = await res.json();

      setConversations((prev) =>
        prev.map((c) =>
          c.id === active.id
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

    const conv = conversations.find((c) => c.id === id) || conversations[0] || null;
    if (!conv) return <div className="empty">No conversation found</div>;
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
          selectConversation={(id) => setActiveId(id)}
          addConversation={() => {}}
          totalCount={conversations.length}
        />

        <main className="main-area">
          <Routes>
            <Route
              path="/"
              element={
                <Navigate to={`/chat/${DEFAULT_CHAT_ID}`} replace />
              }
            />
            <Route path=":id" element={<ChatRoute />} />
            <Route
              path="*"
              element={
                <div className="empty">Select a conversation to start chatting</div>
              }
            />
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
