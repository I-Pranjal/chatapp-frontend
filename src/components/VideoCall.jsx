import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Video as CamOn,
  VideoOff,
  PhoneOff,
  MonitorUp,
  Cog,
} from "lucide-react";

export default function VideoCall({
  isOpen = false,
  onClose = () => {},
  calleeName = "Alice",
  chatName = "",
}) {
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [volume, setVolume] = useState(80);
  const [error, setError] = useState("");

  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  const participants = [
    { id: 1, name: "You" },
    { id: 2, name: "Sam" },
    { id: 3, name: "Ava" },
    { id: 4, name: "Leo" },
  ];

  /* Call timer */
  useEffect(() => {
    if (!isOpen) return;
    setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isOpen]);

  const time = useMemo(() => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [seconds]);

  /* Media handling */
  useEffect(() => {
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
          localVideoRef.current.volume = volume / 100;
          await localVideoRef.current.play();
        }

        stream.getAudioTracks().forEach((t) => (t.enabled = !muted));
      } catch (e) {
        setError("Camera or microphone access denied");
      }
    }

    function stopMedia() {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    }

    if (isOpen && cameraOn) startMedia();
    else stopMedia();

    return stopMedia;
  }, [isOpen, cameraOn]);

  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach(
      (t) => (t.enabled = !muted)
    );
  }, [muted]);

  if (!isOpen) return null;

  return (
    <div style={overlay}>
      <div style={glassLayer} />
      <div style={callShell}>
        <div style={topRow}>
          <div style={titleBlock}>
            <div style={callLabel}>{chatName || calleeName}</div>
            <div style={callMeta}>{error ? error : `Connected • ${time}`}</div>
          </div>
          <div style={badgeRow}>
            <span style={badge}>HD</span>
            <span style={badge}>Secure</span>
          </div>
        </div>

        <div style={stage}>
          {/* Left Side - Local User */}
          <div style={splitPane}>
            <div style={panelBackdrop} />
            {cameraOn && !error ? (
              <video ref={localVideoRef} playsInline muted style={panelVideo} />
            ) : (
              <div style={panelOff}>
                <VideoOff size={48} style={{ opacity: 0.6 }} />
                <div style={offLabel}>Camera Off</div>
              </div>
            )}
            <div style={panelOverlay}>
              <div style={panelName}>You</div>
              <div style={panelBadge}>{muted ? "🔇 Muted" : "🎤 Mic on"}</div>
            </div>
          </div>

          {/* Right Side - Remote User */}
          <div style={splitPane}>
            <div style={panelBackdrop} />
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136"
              alt="remote"
              style={panelVideo}
            />
            <div style={panelOverlay}>
              <div style={panelName}>{calleeName}</div>
              <div style={panelBadge}>{error ? "⏱ Connecting..." : "🟢 Live"}</div>
            </div>
          </div>
        </div>

        <div style={controlsRow}>
          <Control onClick={() => setMuted(!muted)} active={!muted}>
            {muted ? <MicOff /> : <Mic />}
          </Control>

          <Control onClick={() => setCameraOn(!cameraOn)} active={cameraOn}>
            {cameraOn ? <CamOn /> : <VideoOff />}
          </Control>

          <Control>
            <MonitorUp />
          </Control>

          <Control danger onClick={onClose}>
            <PhoneOff />
          </Control>

          <Control>
            <Cog />
          </Control>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI Components ---------- */
const Control = ({ children, onClick, danger, active }) => (
  <button
    onClick={onClick}
    style={{
      width: 48,
      height: 48,
      borderRadius: "50%",
      border: "none",
      background: danger ? "#ff4d4f" : active ? "#0ea5e9" : "#1f2937",
      color: "#fff",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      transition: "transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >
    {children}
  </button>
);

/* ---------- Styles ---------- */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.15), transparent 35%), radial-gradient(circle at 80% 10%, rgba(14,165,233,0.12), transparent 30%), #05070b",
  display: "grid",
  placeItems: "center",
  padding: 16,
  zIndex: 50,
};

const glassLayer = {
  position: "absolute",
  inset: 24,
  borderRadius: 24,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  filter: "blur(2px)",
};

const callShell = {
  position: "relative",
  width: "min(1100px, 94vw)",
  height: "min(720px, 86vh)",
  borderRadius: 28,
  overflow: "hidden",
  background: "rgba(10,12,16,0.7)",
  border: "1px solid rgba(255,255,255,0.04)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  display: "flex",
  flexDirection: "column",
  zIndex: 60,
};

const topRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 22px",
  color: "#e5e7eb",
};

const titleBlock = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const callLabel = {
  fontSize: 18,
  fontWeight: 700,
  color: "#f8fafc",
};

const callMeta = {
  fontSize: 13,
  color: "#cbd5e1",
};

const badgeRow = {
  display: "flex",
  gap: 8,
};

const badge = {
  fontSize: 11,
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(14,165,233,0.15)",
  color: "#67e8f9",
  border: "1px solid rgba(103,232,249,0.35)",
};

const stage = {
  position: "relative",
  flex: 1,
  margin: "0 18px",
  borderRadius: 18,
  overflow: "hidden",
  background: "#0b0f16",
  display: "flex",
  gap: 2,
};

const splitPane = {
  position: "relative",
  flex: 1,
  overflow: "hidden",
  background: "#0f172a",
  borderRadius: 16,
};

const panelBackdrop = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(145deg, rgba(14,165,233,0.12), rgba(13,148,136,0.08))",
  opacity: 0.5,
};

const panelVideo = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: "saturate(1.05)",
};

const panelOff = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 16,
  color: "#cbd5e1",
  background: "rgba(15,23,42,0.85)",
  backdropFilter: "blur(12px)",
};

const offLabel = {
  fontSize: 15,
  fontWeight: 500,
  color: "#94a3b8",
};

const panelOverlay = {
  position: "absolute",
  left: 16,
  bottom: 16,
  right: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "#f8fafc",
  background: "rgba(0,0,0,0.4)",
  padding: "10px 14px",
  borderRadius: 10,
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.05)",
};

const panelName = {
  fontSize: 15,
  fontWeight: 700,
  color: "#f8fafc",
};

const panelBadge = {
  fontSize: 12,
  color: "#cbd5e1",
  background: "rgba(255,255,255,0.08)",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.08)",
};

const controlsRow = {
  display: "flex",
  gap: 14,
  justifyContent: "center",
  padding: "16px 0 24px",
};
