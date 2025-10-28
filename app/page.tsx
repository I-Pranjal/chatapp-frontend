"use client"

import { useState } from "react"
import ChatWindow from "@/components/chat-window"
import ConversationList from "@/components/conversation-list"

export default function Home() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Conversation List */}
      <ConversationList
        selectedId={selectedConversation}
        onSelect={setSelectedConversation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Chat Area */}
      {selectedConversation ? (
        <ChatWindow conversationId={selectedConversation} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="text-6xl mb-4 text-glow">⚡</div>
            <p className="text-muted-foreground text-lg font-mono">SELECT_CONVERSATION.EXE</p>
          </div>
        </div>
      )}
    </div>
  )
}
