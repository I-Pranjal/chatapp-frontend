import React, { useEffect, useMemo, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "./App.css";
import ChatWindow from "./components/chatWindow.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Settings from "./components/Settings.jsx";
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

// Sample conversations for demo
const SAMPLE_CONVERSATIONS = [
  {
    id: "sample-1",
    name: "Sarah Johnson",
    avatarColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    lastMessage: "That sounds great! Let me know when you're ready.",
    lastTime: "2m",
    messages: [
      {
        id: "msg-1",
        text: "Hey! How's the project coming along?",
        ts: new Date(Date.now() - 600000).toISOString(),
        fromMe: false,
      },
      {
        id: "msg-2",
        text: "Going well! Just finishing up the last few features.",
        ts: new Date(Date.now() - 480000).toISOString(),
        fromMe: true,
      },
      {
        id: "msg-3",
        text: "That sounds great! Let me know when you're ready.",
        ts: new Date(Date.now() - 120000).toISOString(),
        fromMe: false,
      },
    ],
  },
  {
    id: "sample-2",
    name: "Engineering Team",
    avatarColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    lastMessage: "Meeting scheduled for tomorrow at 10 AM",
    lastTime: "1h",
    messages: [
      {
        id: "msg-4",
        text: "Good morning everyone! 👋",
        ts: new Date(Date.now() - 7200000).toISOString(),
        fromMe: false,
      },
      {
        id: "msg-5",
        text: "Morning! What's on the agenda today?",
        ts: new Date(Date.now() - 7000000).toISOString(),
        fromMe: true,
      },
      {
        id: "msg-6",
        text: "We need to discuss the new feature requirements.",
        ts: new Date(Date.now() - 6800000).toISOString(),
        fromMe: false,
      },
      {
        id: "msg-7",
        text: "Sounds good. I've prepared some mockups.",
        ts: new Date(Date.now() - 6600000).toISOString(),
        fromMe: true,
      },
      {
        id: "msg-8",
        text: "Meeting scheduled for tomorrow at 10 AM",
        ts: new Date(Date.now() - 3600000).toISOString(),
        fromMe: false,
      },
    ],
  },
  {
    id: "sample-3",
    name: "Michael Chen",
    avatarColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    lastMessage: "Thanks for your help!",
    lastTime: "3h",
    messages: [
      {
        id: "msg-9",
        text: "Could you help me with the deployment issue?",
        ts: new Date(Date.now() - 14400000).toISOString(),
        fromMe: false,
      },
      {
        id: "msg-10",
        text: "Sure! What's the error you're seeing?",
        ts: new Date(Date.now() - 14000000).toISOString(),
        fromMe: true,
      },
      {
        id: "msg-11",
        text: "It's throwing a 500 error when I try to deploy to production.",
        ts: new Date(Date.now() - 13800000).toISOString(),
        fromMe: false,
      },
      {
        id: "msg-12",
        text: "Check your environment variables. That's usually the culprit.",
        ts: new Date(Date.now() - 13600000).toISOString(),
        fromMe: true,
      },
      {
        id: "msg-13",
        text: "That was it! Thanks for your help! 🙏",
        ts: new Date(Date.now() - 10800000).toISOString(),
        fromMe: false,
      },
    ],
  },
  {
    id: "sample-4",
    name: "Emma Wilson",
    avatarColor: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    lastMessage: "See you tomorrow!",
    lastTime: "2d",
    messages: [
      {
        id: "msg-14",
        text: "Are we still on for the design review?",
        ts: new Date(Date.now() - 172800000).toISOString(),
        fromMe: false,
      },
      {
        id: "msg-15",
        text: "Yes! 2 PM tomorrow works for me.",
        ts: new Date(Date.now() - 172700000).toISOString(),
        fromMe: true,
      },
      {
        id: "msg-16",
        text: "Perfect! I'll bring the latest mockups.",
        ts: new Date(Date.now() - 172600000).toISOString(),
        fromMe: false,
      },
      {
        id: "msg-17",
        text: "See you tomorrow! 👋",
        ts: new Date(Date.now() - 172500000).toISOString(),
        fromMe: false,
      },
    ],
  },
];

function AppInner() {
  const [conversations, setConversations] = useState(SAMPLE_CONVERSATIONS);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch messages when activeId changes (skip for sample conversations)
  useEffect(() => {
    if (!activeId || activeId.startsWith('sample-')) return;

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
        console.log("📝 Using sample chat data as fallback...");
        
        // Fallback: Create a sample chat with empty messages
        const fallbackChat = {
          id: activeId,
          name: "Chat User",
          avatarColor: "#4B7BE5",
          messages: [], // Empty messages will trigger the cat animation
        };

        setConversations((prev) => {
          const exists = prev.find((c) => c.id === activeId);
          if (exists) {
            return prev.map((c) => (c.id === activeId ? fallbackChat : c));
          }
          return [...prev, fallbackChat];
        });
      }
    };

    fetchMessages();
  }, [activeId]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  );

  // ✅ Send message dynamically
  async function handleSendMessage(newMessage) {
    if (!newMessage || !newMessage.text?.trim() || !activeId) return;

    // For sample conversations, just update local state
    if (activeId.startsWith('sample-')) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [...c.messages, newMessage],
                lastMessage: newMessage.text,
                lastTime: 'now'
              }
            : c
        )
      );
      return;
    }

    // For real conversations, send to backend
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
          text: newMessage.text.trim(),
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

    // Ensure string comparison for id matching
    const conv = conversations.find((c) => String(c.id) === String(id)) || active;
    if (!conv) {
      console.warn("⚠️ No conversation found for id:", id);
      return <div className="empty">No conversation found</div>;
    }
    console.log("💬 Rendering chat for conversation:", conv);
    return <ChatWindow conversation={conv} onSendMessage={handleSendMessage} />;
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
            <div className="home-animation">
              <DotLottieReact
                src="https://lottie.host/0ccd2445-454e-4cdf-bd9a-36de0e8ff2a3/DXz2JwGevI.lottie"
                loop
                autoplay
              />
            </div>
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
      <Route path="/settings" element={<Settings />} />
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
