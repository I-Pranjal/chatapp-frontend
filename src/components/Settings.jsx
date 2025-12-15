import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5001/api';

export default function Settings() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    _id: '',
    name: '',
    contact: '',
    createdAt: '',
    updatedAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Response status:', res.status);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setUserProfile({
        _id: data._id || '',
        name: data.name || '',
        contact: data.contact || '',
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
      });
      setLoading(false);
    } catch (err) {
      console.error('❌ Failed to load user profile:', err);
      setError(`Failed to load profile: ${err.message}`);
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button
          className="icon-btn back-btn"
          onClick={() => navigate('/chat')}
          title="Back to chats"
          aria-label="Back to chats"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="settings-title">Settings</h1>
        <div style={{ width: '32px' }}></div>
      </div>

      <div className="settings-content">
        {error && <div className="settings-error">{error}</div>}
        
        {loading ? (
          <div className="settings-loading">Loading profile...</div>
        ) : (
          <form className="settings-form">
            <div className="form-group">
              <label htmlFor="userId">User ID</label>
              <input
                type="text"
                id="userId"
                value={userProfile._id}
                readOnly
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={userProfile.name}
                readOnly
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact">Contact</label>
              <input
                type="text"
                id="contact"
                value={userProfile.contact}
                readOnly
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="createdAt">Account Created</label>
              <input
                type="text"
                id="createdAt"
                value={formatDate(userProfile.createdAt)}
                readOnly
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="updatedAt">Last Updated</label>
              <input
                type="text"
                id="updatedAt"
                value={formatDate(userProfile.updatedAt)}
                readOnly
                className="form-input"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
