import React, { useRef, useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import MessageBox from "./MessageBox";
import ChatHeader from "./ChatHeader";

const CHAT_API = "http://localhost:5003/api/chats"; // Chat service

const timeString = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function ChatWindow({
  conversation = { id: "", name: "", avatarColor: "#4B7BE5", messages: [] },
  onSendMessage = () => {},
  activeChatUser = null,
}) {
  const messagesEnd = useRef(null);
  const [chatInfo, setChatInfo] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatError, setChatError] = useState("");

  // Ensure conversation has all required fields
  const safeConversation = {
    id: conversation?.id || "",
    name: conversation?.name || "User",
    avatarColor: conversation?.avatarColor || "#4B7BE5",
    messages: Array.isArray(conversation?.messages) ? conversation.messages : [],
  };

  // Fetch chat details to get member names
  useEffect(() => {
    if (!safeConversation.id || safeConversation.id.startsWith("sample-")) {
      setChatInfo(null);
      return;
    }

    async function fetchChatInfo() {
      try {
        setLoadingChat(true);
        setChatError("");
        const token = localStorage.getItem("token");
        if (!token) {
          setChatError("No auth token");
          setLoadingChat(false);
          return;
        }
        const res = await fetch(`${CHAT_API}/${safeConversation.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            // Send profile id so backend can authorize one-on-one chat members
            "x-profile-user-id": localStorage.getItem("userProfileId") || localStorage.getItem("userId"),
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("📋 Fetched chat details:", data);
        setChatInfo(data);

        // Prefer global activeChatUser from App; if not present, try to infer
        if (activeChatUser) {
          setUserDetails(activeChatUser);
        } else if (!data.isGroupChat && data.members?.length === 2) {
          const profileId = localStorage.getItem("userProfileId") || localStorage.getItem("userId");
          const authId = localStorage.getItem("authUserId");
          // Find the other member id against both profile and auth ids
          const otherMember = data.members.find((m) => m._id !== profileId && m._id !== authId);
          if (otherMember?._id) {
            try {
              const userRes = await fetch(`http://localhost:5002/api/users/${otherMember._id}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });
              if (userRes.ok) {
                const userData = await userRes.json();
                setUserDetails(userData.user);
              }
            } catch (err) {
              console.warn("⚠️ Could not fetch user details:", err);
            }
          }
        }
      } catch (err) {
        console.error("❌ Failed to load chat info:", err);
        setChatError(err.message);
      } finally {
        setLoadingChat(false);
      }
    }

    fetchChatInfo();
  }, [safeConversation.id, activeChatUser]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [safeConversation.messages?.length]);

  return (
    <div className="chat-window">
      {/* Header */}
      <ChatHeader
        chatInfo={chatInfo}
        userDetails={activeChatUser || userDetails}
        avatarColor={safeConversation.avatarColor}
        fallbackName={safeConversation.name}
        currentUserId={localStorage.getItem("userProfileId") || localStorage.getItem("userId")}
      />

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
      <MessageBox chatId={safeConversation.id} onSendMessage={onSendMessage} />
    </div>
  );
}
