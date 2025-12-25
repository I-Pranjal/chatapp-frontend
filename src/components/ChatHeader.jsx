import React from "react";
import { Video, Phone, MoreHorizontal } from "lucide-react";

export default function ChatHeader({ chatInfo, userDetails, avatarColor, fallbackName, currentUserId, onStartVideoCall }) {
  const displayName = (() => {
    console.log("ChatHeader - chatInfo:", chatInfo);
    if (chatInfo?.name) return chatInfo.name;
    if (userDetails?.name) return userDetails.name;
    if (chatInfo?.members?.length === 2) {
      const other = chatInfo.members.find((m) => m._id !== currentUserId);
      return other?.name || fallbackName;
    }
    return fallbackName;
  })();

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return null;
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="chat-header">
      <div className="header-left">
        <div className="avatar small" style={{ background: avatarColor }}>
          {displayName?.[0]}
        </div>
        <div className="title">
          <div className="name">{displayName}</div>
          <div className="status">
            {chatInfo?.isGroupChat ? (
              <span>{chatInfo?.members?.length || 0} members</span>
            ) : userDetails ? (
              <>
                {userDetails.contact && <span>{userDetails.contact}</span>}
                {userDetails.online ? (
                  <span className="online-badge">● Online</span>
                ) : userDetails.lastSeen ? (
                  <span>Last seen {formatLastSeen(userDetails.lastSeen)}</span>
                ) : (
                  <span>Offline</span>
                )}
              </>
            ) : (
              <span>Click to view profile</span>
            )}
          </div>
        </div>
      </div>
      <div className="header-right">
        <button className="icon-btn" aria-label="Start voice call">
          <Phone size={18} />
        </button>
        <button
          className="icon-btn"
          aria-label="Start video call"
          onClick={() => (typeof onStartVideoCall === 'function' ? onStartVideoCall() : console.log('Video call clicked'))}
        >
          <Video size={18} />
        </button>
        <button className="icon-btn" aria-label="More options">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
