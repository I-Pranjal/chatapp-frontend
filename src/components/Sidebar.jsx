import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  query,
  setQuery,
  activeId,
  selectConversation,
  addConversation,
  filteredConversations = [],
  totalCount = 0,
}) {
  const [users, setUsers] = useState([]);
  const [useSampleData, setUseSampleData] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get('http://localhost:5002/api/users');
        setUsers(response.data.users);
        // console.log('Fetched users from backend:', response.data.users);
        setUseSampleData(false);
      } catch (error) {
        console.log('Using sample data - backend not available');
        setUseSampleData(true);
      }
    }

    fetchUsers();
  }, []);

  // Use sample conversations if backend is not available
  const displayItems = useSampleData ? filteredConversations : users.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-top">
        <h2 className="brand">Messages</h2>
        <div className="sidebar-actions">
          <button
            className="icon-btn"
            onClick={() => addConversation('New Chat')}
            title="New chat"
            aria-label="New chat"
          >
            <Plus size={18} />
          </button>
          <button
            className="icon-btn"
            onClick={() => navigate('/settings')}
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="search-wrap">
        <div style={{ position: 'relative' }}>
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#9b9a97'
            }} 
          />
          <input
            placeholder="Search conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="conversations">
        {useSampleData ? (
          // Display sample conversations
          displayItems.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${conv.id === activeId ? 'active' : ''}`}
              onClick={() => selectConversation(conv.id)}
            >
              <div 
                className="avatar" 
                style={{ background: conv.avatarColor }}
              >
                {conv.name[0]}
              </div>
              <div className="meta">
                <div className="name-row">
                  <div className="name">{conv.name}</div>
                  <div className="last" style={{ marginLeft: 'auto', fontSize: '12px' }}>
                    {conv.lastTime}
                  </div>
                </div>
                <div className="last">
                  {conv.lastMessage}
                </div>
              </div>
            </div>
          ))
        ) : (
          // Display real users from backend
          displayItems.map((user) => (
            <div
              key={user._id}
              className={`conversation-item ${user._id === activeId ? 'active' : ''}`}
              onClick={() => selectConversation(user._id)}
            >
              <div 
                className="avatar" 
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                }}
              >
                {user.name[0]}
              </div>
              <div className="meta">
                <div className="name-row">
                  <div className="name">{user.name}</div>
                </div>
                <div className="last">
                  {user.lastSeen ? new Date(user.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Offline'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        {useSampleData ? `${totalCount} conversations` : `${users.filter((user) => user.online).length} online`}
      </div>
    </aside>
  );
}
