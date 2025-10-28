import React, { useEffect, useMemo, useState } from 'react'
import './App.css'
import ChatWindow from './components/chatWindow.jsx'
import Sidebar from './components/Sidebar.jsx'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, Link } from 'react-router-dom'
import LoginPage from './pages/login.jsx'

function AppInner() {
  const INITIAL = []
  const [conversations, setConversations] = useState(() => {
    try {
      const raw = localStorage.getItem('chatt:conversations')
      return raw ? JSON.parse(raw) : INITIAL
    } catch (e) {
      return INITIAL
    }
  })

  const [activeId, setActiveId] = useState(conversations[0]?.id || null)
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('chatt:conversations', JSON.stringify(conversations))
  }, [conversations])

  const active = useMemo(() => conversations.find((c) => c.id === activeId) || conversations[0] || null, [conversations, activeId])

  useEffect(() => {
    if (!active && conversations.length) setActiveId(conversations[0].id)
  }, [active, conversations])

  function selectConversation(id) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
    setActiveId(id)
    navigate(`/chat/${id}`)
    if (window.innerWidth < 900) setSidebarOpen(false)
  }

  function sendMessage(text) {
    if (!text.trim() || !active) return
    const msg = { id: 'm' + Date.now(), fromMe: true, text: text.trim(), ts: Date.now() }
    setConversations((prev) => prev.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, msg], lastMessage: msg.text } : c)))
  }

  function receiveMockReply() {
    if (!active) return
    const reply = { id: 'r' + Date.now(), fromMe: false, text: 'Nice — got your message!', ts: Date.now() }
    setTimeout(() => {
      setConversations((prev) => prev.map((c) => {
        if (c.id === active.id) return { ...c, messages: [...c.messages, reply], lastMessage: reply.text }
        return c
      }))
    }, 800)
  }

  function handleSendAndReply(text) {
    sendMessage(text)
    receiveMockReply()
  }

  function addConversation(name) {
    const id = 'c' + Date.now()
    const newConv = { id, name, avatarColor: '#34d399', unread: 0, lastMessage: '', messages: [] }
    setConversations((prev) => [newConv, ...prev])
    setActiveId(id)
    navigate(`/chat/${id}`)
  }

  function filteredConversations() {
    const q = query.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) => c.name.toLowerCase().includes(q) || (c.lastMessage || '').toLowerCase().includes(q))
  }

  function ChatRoute() {
    const { id } = useParams()
    useEffect(() => {
      if (id) setActiveId(id)
    }, [id])

    const conv = conversations.find((c) => c.id === id) || conversations[0] || null
    if (!conv) return <div className="empty">No conversation found</div>
    return <ChatWindow conversation={conv} onSend={handleSendAndReply} />
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
          selectConversation={selectConversation}
          addConversation={addConversation}
          totalCount={conversations.length}
        />

        <main className="main-area">
          <Routes>
            <Route path="/" element={<Navigate to={`/chat/${conversations[0]?.id || ''}`} replace />} />
            <Route path=":id" element={<ChatRoute />} />
            <Route path="*" element={<div className="empty">Select a conversation to start chatting</div>} />
          </Routes>
        </main>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="home">
            <h1>Welcome</h1>
            <nav style={{ display: 'flex', gap: 12 }}>
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
  )
}

export default function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  )
}
