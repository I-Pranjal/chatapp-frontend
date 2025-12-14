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

      if (data.token) localStorage.setItem("token", data.token);
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
      className="min-h-screen flex items-center justify-center px-4"
      style={{ 
        width: "100vw",
        background: "#f7f6f3",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      <div 
        className="w-full max-w-md bg-white p-8"
        style={{
          borderRadius: "20px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
          border: "1px solid #e9e8e5"
        }}
      >
        <h2 
          className="text-3xl font-semibold text-center mb-2"
          style={{ color: "#37352f" }}
        >
          {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
        </h2>
        <p 
          className="text-center text-sm mb-8"
          style={{ color: "#787774" }}
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

        <form onSubmit={handleSubmit} noValidate>
          {/* Name (Sign Up Only) */}
          {!isLogin && (
            <div className="mb-4 relative">
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1"
                style={{ color: "#37352f" }}
              >
                Name
              </label>
              <div className="relative">
                <User 
                  className="absolute left-3 top-2.5 w-4 h-4" 
                  style={{ color: "#9b9a97" }}
                />
                <input
                  id="name"
                  className="block w-full pl-9 pr-3 py-2 text-sm"
                  style={{
                    background: "#ffffff",
                    color: "#37352f",
                    border: "1px solid #e9e8e5",
                    borderRadius: "8px",
                    transition: "all 0.15s"
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
          <div className="mb-4 relative">
            <label
              htmlFor="contact"
              className="block text-sm font-medium mb-1"
              style={{ color: "#37352f" }}
            >
              Contact No.
            </label>
            <div className="relative">
              <Phone 
                className="absolute left-3 top-2.5 w-4 h-4" 
                style={{ color: "#9b9a97" }}
              />
              <input
                id="contact"
                className="block w-full pl-9 pr-3 py-2 text-sm"
                style={{
                  background: "#ffffff",
                  color: "#37352f",
                  border: "1px solid #e9e8e5",
                  borderRadius: "8px",
                  transition: "all 0.15s"
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
          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
              style={{ color: "#37352f" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock 
                className="absolute left-3 top-2.5 w-4 h-4" 
                style={{ color: "#9b9a97" }}
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="block w-full pl-9 pr-10 py-2 text-sm"
                style={{
                  background: "#ffffff",
                  color: "#37352f",
                  border: "1px solid #e9e8e5",
                  borderRadius: "8px",
                  transition: "all 0.15s"
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onFocus={(e) => e.target.style.borderColor = "#2383e2"}
                onBlur={(e) => e.target.style.borderColor = "#e9e8e5"}
              />
              <Eye
                onClick={() => setShowPassword((s) => !s)}
                className="w-4 h-4 absolute right-3 top-3 cursor-pointer"
                style={{ color: "#9b9a97" }}
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
            className="w-full py-2 font-semibold text-white transition-all duration-200"
            style={{
              background: loading ? "rgba(35, 131, 226, 0.5)" : "#2383e2",
              borderRadius: "8px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer"
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
          className="text-center text-sm mt-6 flex items-center justify-center"
          style={{ color: "#787774" }}
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
