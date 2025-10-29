import React, { useRef, useEffect } from "react";
import { Video, Phone, Ellipsis } from "lucide-react";
import MessageBox from "./MessageBox";

const timeString = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function ChatWindow({
  conversation = { id: "", name: "", avatarColor: "#ccc", messages: [] },
  onSendMessage = () => {},
}) {
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.messages?.length]);

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <div
            className="avatar small"
            style={{ background: conversation.avatarColor }}
          >
            {conversation.name?.[0]}
          </div>
          <div className="title">
            <div className="name">{conversation.name}</div>
            <div className="status">Active now</div>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn">
            <Phone />
          </button>
          <button className="icon-btn">
            <Video />
          </button>
          <button className="icon-btn">
            <Ellipsis />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages" role="log" aria-live="polite">
        {conversation.messages?.map((m) => (
          <div
            key={m.id || m._id}
            className={`message-row ${m.fromMe ? "from-me" : "from-them"}`}
          >
            {!m.fromMe && (
              <div
                className="avatar tiny"
                style={{ background: conversation.avatarColor }}
              >
                {conversation.name?.[0]}
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
        ))}
        <div ref={messagesEnd} />
      </div>

      {/* Input Composer */}
      <MessageBox
        chatId={conversation.id}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}
