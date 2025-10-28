import React, { useState, useRef, useEffect } from 'react'
import { Video, Phone, Ellipsis } from 'lucide-react'

const timeString = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatWindow({ conversation = { name: '', avatarColor: '#ccc', messages: [] }, onSend = () => {} }) {
  const [input, setInput] = useState('')
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [conversation.messages.length])

  function submit(e) {
    e?.preventDefault()
    if (!input.trim()) return
    onSend(input)
    setInput('')
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="header-left">
          <div className="avatar small" style={{ background: conversation.avatarColor }}>{conversation.name?.[0]}</div>
          <div className="title">
            <div className="name">{conversation.name}</div>
            <div className="status">Active now</div>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn"><Phone /></button>
          <button className="icon-btn"><Video /></button>
          <button className="icon-btn"><Ellipsis /></button>
        </div>
      </div>

      <div className="messages" role="log" aria-live="polite">
        {conversation.messages.map((m) => (
          <div key={m.id} className={`message-row ${m.fromMe ? 'from-me' : 'from-them'}`}>
            {/* Incoming message: avatar left, content column, no right avatar */}
            {!m.fromMe && <div className="avatar tiny" style={{ background: conversation.avatarColor }}>{conversation.name?.[0]}</div>}

            <div className="message-content">
              <div className="bubble">
                <div className="text">{m.text}</div>
              </div>
              <div className={`ts-outside ${m.fromMe ? 'right' : 'left'}`}>{timeString(m.ts)}</div>
            </div>

            {/* Outgoing message: small 'me' avatar on right */}
            {m.fromMe && <div className="avatar tiny me">●</div>}
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      <form className="composer" onSubmit={submit}>
        <button type="button" className="attach">📎</button>
        <input aria-label="Type a message" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
        <button type="submit" className="send">➤</button>
      </form>
    </div>
  )
}