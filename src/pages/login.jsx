import React, { useState } from "react";
import { Lock, User, Phone, Eye } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const validate = () => {
    const e = {};
    if (!contact.trim()) e.contact = "Contact number is required.";
    else if (!/^\d{7,15}$/.test(contact.trim()))
      e.contact = "Contact must be digits (7–15 characters).";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (!isLogin && !name.trim()) e.name = "Name is required.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setMessage(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const url = isLogin
        ? "http://localhost:5001/api/auth/login"
        : "http://localhost:5001/api/auth/register";

      const body = isLogin
        ? { contact, password }
        : { name, contact, password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed");

      // Store the access token from auth service
      const token = data.accessToken || data.token;
      if (token) {
        localStorage.setItem("token", token);
        // Optionally store refresh token
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
      } else {
        throw new Error("No authentication token received");
      }

      // Fetch and store user info (Auth service)
      try {
        const userRes = await fetch('http://localhost:5001/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          // Store Auth microservice user id separately
          localStorage.setItem('authUserId', userData._id);
          localStorage.setItem('userName', userData.name);
          localStorage.setItem('userContact', userData.contact);
          console.log('✅ User info stored:', userData);

          // Map to Users microservice profile via contact and store profile user id
          try {
            const profileRes = await fetch('http://localhost:5002/api/users', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            if (profileRes.ok) {
              const list = await profileRes.json();
              const match = Array.isArray(list.users)
                ? list.users.find((u) => String(u.contact) === String(userData.contact))
                : null;
              if (match?._id) {
                localStorage.setItem('userProfileId', match._id);
                // For backward compatibility, keep userId as profile id
                localStorage.setItem('userId', match._id);
                console.log('👤 Mapped profile user id:', match._id);
              } else {
                console.warn('⚠️ Unable to map profile user by contact. Falling back to auth id for userId.');
                localStorage.setItem('userId', userData._id);
              }
            } else {
              console.warn('⚠️ Failed to fetch users list for profile mapping');
              localStorage.setItem('userId', userData._id);
            }
          } catch (mapErr) {
            console.warn('⚠️ Error mapping to profile user:', mapErr);
            localStorage.setItem('userId', userData._id);
          }
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch user info:', err);
      }

      setMessage({
        type: "success", 
        text: isLogin
          ? "Login successful ✅"
          : "Account created successfully 🎉",
      });
      // Go to chat page 
      window.location.href = "/chat";
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center"
      style={{ 
        background: "#f7f6f3",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "24px"
      }}
    >
      <div 
        className="w-full max-w-md bg-white"
        style={{
          borderRadius: "20px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
          border: "1px solid #e9e8e5",
          padding: "24px 24px"
        }}
      >
        <h2 
          className="text-3xl font-semibold text-center mb-2"
          style={{ color: "#37352f" }}
        >
          {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
        </h2>
        <p 
          className="text-center text-sm"
          style={{ color: "#787774", marginBottom: "20px" }}
        >
          {isLogin
            ? "Sign in to continue chatting"
            : "Join now to start chatting with friends"}
        </p>

        {message && (
          <div
            className="text-sm text-center mb-3 px-4 py-2 rounded-lg"
            style={{
              color: message.type === "success" ? "#10b981" : "#ef4444",
              background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${message.type === "success" ? "#d1fae5" : "#fecaca"}`
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "grid", gap: "14px" }}>
          {/* Name (Sign Up Only) */}
          {!isLogin && (
            <div className="relative" style={{ marginBottom: "6px" }}>
              <label
                htmlFor="name"
                className="block text-sm font-medium"
                style={{ color: "#37352f", marginBottom: "8px" }}
              >
                Name
              </label>
              <div className="relative">
                <User 
                  className="absolute w-4 h-4" 
                  style={{ color: "#9b9a97", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  id="name"
                  className="block w-full text-sm"
                  style={{
                    background: "#ffffff",
                    color: "#37352f",
                    border: "1px solid #e9e8e5",
                    borderRadius: "8px",
                    transition: "all 0.15s",
                    paddingLeft: "36px",
                    paddingRight: "14px",
                    paddingTop: "10px",
                    paddingBottom: "10px"
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  onFocus={(e) => e.target.style.borderColor = "#2383e2"}
                  onBlur={(e) => e.target.style.borderColor = "#e9e8e5"}
                />
              </div>
              {errors.name && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.name}</p>
              )}
            </div>
          )}

          {/* Contact */}
          <div className="relative" style={{ marginBottom: "6px" }}>
            <label
              htmlFor="contact"
              className="block text-sm font-medium"
              style={{ color: "#37352f", marginBottom: "8px" }}
            >
              Contact No.
            </label>
            <div className="relative">
              <Phone 
                className="absolute w-4 h-4" 
                style={{ color: "#9b9a97", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                id="contact"
                className="block w-full text-sm"
                style={{
                  background: "#ffffff",
                  color: "#37352f",
                  border: "1px solid #e9e8e5",
                  borderRadius: "8px",
                  transition: "all 0.15s",
                  paddingLeft: "36px",
                  paddingRight: "14px",
                  paddingTop: "10px",
                  paddingBottom: "10px"
                }}
                value={contact}
                onChange={(e) =>
                  setContact(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder="Your phone number"
                inputMode="numeric"
                onFocus={(e) => e.target.style.borderColor = "#2383e2"}
                onBlur={(e) => e.target.style.borderColor = "#e9e8e5"}
              />
            </div>
            {errors.contact && (
              <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.contact}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative" style={{ marginBottom: "10px" }}>
            <label
              htmlFor="password"
              className="block text-sm font-medium"
              style={{ color: "#37352f", marginBottom: "8px" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock 
                className="absolute w-4 h-4" 
                style={{ color: "#9b9a97", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="block w-full text-sm"
                style={{
                  background: "#ffffff",
                  color: "#37352f",
                  border: "1px solid #e9e8e5",
                  borderRadius: "8px",
                  transition: "all 0.15s",
                  paddingLeft: "36px",
                  paddingRight: "40px",
                  paddingTop: "10px",
                  paddingBottom: "10px"
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onFocus={(e) => e.target.style.borderColor = "#2383e2"}
                onBlur={(e) => e.target.style.borderColor = "#e9e8e5"}
              />
              <Eye
                onClick={() => setShowPassword((s) => !s)}
                className="w-4 h-4 absolute cursor-pointer"
                style={{ color: "#9b9a97", right: "8px", top: "50%", transform: "translateY(-50%)" }}
                onMouseEnter={(e) => e.target.style.color = "#37352f"}
                onMouseLeave={(e) => e.target.style.color = "#9b9a97"}
              />
            </div>
            {errors.password && (
              <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold text-white"
            style={{
              background: loading ? "rgba(35, 131, 226, 0.5)" : "#2383e2",
              borderRadius: "10px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              padding: "11px 14px",
              transition: "background .15s ease"
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = "#1a6ec4")}
            onMouseLeave={(e) => !loading && (e.target.style.background = "#2383e2")}
          >
            {loading
              ? isLogin
                ? "Signing in..."
                : "Creating account..."
              : isLogin
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>

        {/* Switch Mode */}
        <p 
          className="text-center text-sm flex items-center justify-center"
          style={{ color: "#787774", marginTop: "16px" }}
        >
          {isLogin ? "New here ? " : "Already registered ? "}{" "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
              setErrors({});
              setPassword("");
            }}
            className="font-medium px-2 cursor-pointer"
            style={{ color: "#2383e2" }}
            onMouseEnter={(e) => {
              e.target.style.color = "#1a6ec4";
              e.target.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#2383e2";
              e.target.style.textDecoration = "none";
            }}
          >
            {isLogin ? " Sign up" : " Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}
