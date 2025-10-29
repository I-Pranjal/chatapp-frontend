import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  query,
  setQuery,
  activeId,
  selectConversation,
  addConversation,
}) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get('http://localhost:5002/api/users');
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-top">
        <h2 className="brand">Messages</h2>
        <div className="sidebar-actions">
          <button
            className="icon-btn"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="toggle sidebar"
          >
            ☰
          </button>
          <button
            className="icon-btn"
            onClick={() => addConversation('New Chat')}
            title="New chat"
          >
            ＋
          </button>
        </div>
      </div>

      <div className="search-wrap">
        <input
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="conversations">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className={`conversation-item ${user._id === activeId ? 'active' : ''}`}
            onClick={() => selectConversation(user._id)}
          >
            <div className="avatar" style={{ background: '#ccc' }}>
              {user.name[0]}
            </div>
            <div className="meta">
              <div className="name-row">
                <div className="name">{user.name}</div>
              </div>
              <div className="last">
                Last seen: {user.lastSeen ? new Date(user.lastSeen).toLocaleString() : 'Unknown'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        Online • {users.filter((user) => user.online).length}
      </div>
    </aside>
  );
}
