import React from 'react'

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  query,
  setQuery,
  filteredConversations = [],
  activeId,
  selectConversation,
  addConversation,
  totalCount,
}) {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-top">
        <h2 className="brand">Messages</h2>
        <div className="sidebar-actions">
          <button className="icon-btn" onClick={() => setSidebarOpen((s) => !s)} aria-label="toggle sidebar">☰</button>
          <button className="icon-btn" onClick={() => addConversation('New Chat')} title="New chat">＋</button>
        </div>
      </div>

      <div className="search-wrap">
        <input placeholder="Search conversations..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="conversations">
        {filteredConversations.map((c) => (
          <div key={c.id} className={`conversation-item ${c.id === activeId ? 'active' : ''}`} onClick={() => selectConversation(c.id)}>
            <div className="avatar" style={{ background: c.avatarColor }}>{c.name[0]}</div>
            <div className="meta">
              <div className="name-row">
                <div className="name">{c.name}</div>
                {c.unread ? <div className="badge">{c.unread}</div> : null}
              </div>
              <div className="last">{c.lastMessage}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">Online • {totalCount ?? filteredConversations.length}</div>
    </aside>
  )
}
