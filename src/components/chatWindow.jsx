import React, { useRef, useEffect, useState } from "react";
import { Video, Phone, MoreHorizontal } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import MessageBox from "./MessageBox";

const API_BASE = "http://localhost:5002/api"; // Users service

const timeString = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function ChatWindow({
  conversation = { id: "", name: "", avatarColor: "#4B7BE5", messages: [] },
  onSendMessage = () => {},
}) {
  const messagesEnd = useRef(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [userError, setUserError] = useState("");

  // Ensure conversation has all required fields
  const safeConversation = {
    id: conversation?.id || "",
    name: conversation?.name || "User",
    avatarColor: conversation?.avatarColor || "#4B7BE5",
    messages: Array.isArray(conversation?.messages) ? conversation.messages : [],
  };

  // Fetch user information
  useEffect(() => {
    if (!safeConversation.id || safeConversation.id.startsWith("sample-")) {
      setUserInfo(null);
      return;
    }

    async function fetchUserInfo() {
      try {
        setLoadingUser(true);
        setUserError("");
        const token = localStorage.getItem("token");
        if (!token) {
          setUserError("No auth token");
          setLoadingUser(false);
          return;
        }
        const res = await fetch(`${API_BASE}/users/${safeConversation.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Fetched user info:", data.user.name);
        console.log(safeConversation.name); 
        setUserInfo(data.user);
      } catch (err) {
        console.error("❌ Failed to load user info:", err);
        setUserError(err.message);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchUserInfo();
  }, [safeConversation.id]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [safeConversation.messages?.length]);

  return (
    <div className="chat-window">
      {/* Unified Header */}
      <div className="chat-header">
        <div className="header-left">
          <div
            className="avatar small"
            style={{ background: safeConversation.avatarColor }}
          >
            {safeConversation.name?.[0]}
          </div>
          <div className="title">
            <div className="name">{userInfo?.name || safeConversation.name}</div>
            <div className="status">
              {userInfo?.contact && <span>{userInfo.contact}</span>}
              {userInfo?.online ? (
                <span className="online-badge">● Online</span>
              ) : (
                <span className="offline-badge">● Offline</span>
              )}
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn" aria-label="Start voice call">
            <Phone size={18} />
          </button>
          <button className="icon-btn" aria-label="Start video call">
            <Video size={18} />
          </button>
          <button className="icon-btn" aria-label="More options">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages" role="log" aria-live="polite">
        {!safeConversation.messages || safeConversation.messages.length === 0 ? (
          // Empty state with cat animation
          <div className="empty-chat-state">
            <div className="cat-animation">
              <DotLottieReact
              src="https://lottie.host/0ccd2445-454e-4cdf-bd9a-36de0e8ff2a3/DXz2JwGevI.lottie"
              loop
              autoplay
            />
            </div>
            <div className="empty-message">
              <h3>No messages yet</h3>
              <p>Start a conversation with {safeConversation.name}!</p>
            </div>
          </div>
        ) : (
          safeConversation.messages?.map((m) => (
            <div
              key={m.id || m._id}
              className={`message-row ${m.fromMe ? "from-me" : "from-them"}`}
            >
              {!m.fromMe && (
                <div
                  className="avatar tiny"
                  style={{ background: safeConversation.avatarColor }}
                >
                  {safeConversation.name?.[0]}
                </div>
              )}

              <div className="message-content">
                <div className="bubble">
                  <div className="text">{m.text}</div>
                </div>
                <div className={`ts-outside ${m.fromMe ? "right" : "left"}`}>
                  {timeString(m.ts)}
                </div>
              </div>

              {m.fromMe && <div className="avatar tiny me">●</div>}
            </div>
          ))
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input Composer */}
      <MessageBox
        chatId={safeConversation.id}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}
