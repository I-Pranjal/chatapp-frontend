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
  fetchActiveChatUser,
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

  async function handleUserClick(user) {
    if (useSampleData) {
      selectConversation(user.id);
      return;
    }
    console.log('User clicked:', user);

    try {
      const token = localStorage.getItem('token');
      const profileUserId = localStorage.getItem('authUserId') ;
      // console.log('Creating/accessing chat with user:', profileUserId);
      if (!token) {
        console.error('No auth token found. Redirecting to login.');
        navigate('/login');
        return;
      }

      const res = await fetch('http://localhost:5003/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // Always use Users microservice ids to initiate chat
        // Pass the initiator's profile id as well for services that support it
        body: JSON.stringify({ userId: user.authID, initiatedByProfileId: profileUserId }),
      });

      if (!res.ok) {
        const txt = await res.text();
        if (res.status === 401 || res.status === 403) {
          console.warn('Auth failed while creating/accessing chat. Please log in again.');
          navigate('/login');
          return;
        }
        throw new Error(`Failed to create/access chat: ${txt}`);
      }

      const chat = await res.json();
      const chatId = chat._id || chat.id;
      console.log('Chat ID:', chatId);

      // Fetch active chat user info
      if (fetchActiveChatUser && user._id) {
        await fetchActiveChatUser(user._id);
      }

      if (chatId) {
        selectConversation(chatId);
      }
    } catch (err) {
      console.error('Error creating/accessing chat:', err);
    }
  }

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
              onClick={() => handleUserClick(user)}
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
                  {/* {user.authID} */}
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
