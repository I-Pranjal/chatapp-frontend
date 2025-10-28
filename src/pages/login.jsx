import React, { useState } from "react";
import { Lock, User, Phone, Eye } from "lucide-react";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!contact.trim()) e.contact = "Contact number is required.";
    else if (!/^\d{7,15}$/.test(contact.trim()))
      e.contact = "Contact must be digits (7-15 characters).";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters.";
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          password,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Login failed");
      }

      const data = await res.json();
      if (data.token) localStorage.setItem("token", data.token);
      setMessage({ type: "success", text: "Login successful." });
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-400 via-emerald-500 to-teal-600 font-sans px-4" style={{width:"100vw"}}>
      <div className="w-full max-w-md bg-black/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 ring-1 ring-white/20">
        <h2 className="text-3xl font-semibold text-center text-white mb-6">
          Welcome Back 👋
        </h2>
        <p className="text-center text-white/80 text-sm mb-8">
          Sign in to continue chatting
        </p>

        {message?.type === "success" && (
          <div className="text-green-300 text-sm text-center mb-3">
            {message.text}
          </div>
        )}
        {message?.type === "error" && (
          <div className="text-red-300 text-sm text-center mb-3">
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="mb-4 relative">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white mb-1"
            >
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-white/70 w-4 h-4" />
              <input
                id="name"
                className="block w-full bg-white/20 text-white placeholder-white/50 rounded-lg pl-9 pr-3 py-2 border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            {errors.name && (
              <p className="text-red-300 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Contact */}
          <div className="mb-4 relative">
            <label
              htmlFor="contact"
              className="block text-sm font-medium text-white mb-1"
            >
              Contact No.
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 text-white/70 w-4 h-4" />
              <input
                id="contact"
                className="block w-full bg-white/20 text-white placeholder-white/50 rounded-lg pl-9 pr-3 py-2 border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                value={contact}
                onChange={(e) =>
                  setContact(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder="Your phone number"
                inputMode="numeric"
              />
            </div>
            {errors.contact && (
              <p className="text-red-300 text-xs mt-1">{errors.contact}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-white/70 w-4 h-4" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="block w-full bg-white/20 text-white placeholder-white/50 rounded-lg pl-9 pr-10 py-2 border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />

                <Eye 
                onClick={() => setShowPassword((s) => !s)}
                className="w-4 h-4 absolute right-3 top-3" />
            </div>
            {errors.password && (
              <p className="text-red-300 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition-all duration-200 ${
              loading
                ? "bg-emerald-400/50 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600"
            } focus:outline-none focus:ring-2 focus:ring-emerald-300`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
