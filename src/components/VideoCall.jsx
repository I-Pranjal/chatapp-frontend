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
      {/* Remote Video */}
       <div style={pip}>
        {cameraOn && !error ? (
          <video ref={localVideoRef} playsInline muted style={pipVideo} />
        ) : (
          <div style={pipOff}>Camera Off</div>
        )}
      </div>
     

      {/* Top Header */}
       <div style={remoteVideo}>
        <img
          src="https://images.unsplash.com/photo-1544717305-2782549b5136"
          alt="remote"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Local PiP */}
      <div style={pip}>
        {cameraOn && !error ? (
          <video ref={localVideoRef} playsInline muted style={pipVideo} />
        ) : (
          <div style={pipOff}>Camera Off</div>
        )}
      </div>

      {/* Participants */}
      <div style={participantsBar}>
        {participants.map((p) => (
          <div key={p.id} style={participant}>
            {p.name[0]}
          </div>
        ))}
      </div>

      {/* Volume */}
      <div style={volumeBar}>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(+e.target.value)}
          style={volumeSlider}
        />
      </div>

      {/* Controls */}
      <div style={controls}>
        <Control onClick={() => setMuted(!muted)}>
          {muted ? <MicOff /> : <Mic />}
        </Control>

        <Control onClick={() => setCameraOn(!cameraOn)}>
          {cameraOn ? <VideoOff /> : <CamOn />}
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
  );
}

/* ---------- UI Components ---------- */
const Control = ({ children, onClick, danger }) => (
  <button
    onClick={onClick}
    style={{
      width: 48,
      height: 48,
      borderRadius: "50%",
      border: "none",
      background: danger ? "#ff4d4f" : "#fff",
      color: danger ? "#fff" : "#000",
      display: "grid",
      placeItems: "center",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

/* ---------- Styles ---------- */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "#000",
};

const remoteVideo = {
  position: "absolute",
  inset: 0,
};

const topBar = {
  position: "absolute",
  top: 16,
  left: 16,
  color: "#fff",
  background: "rgba(0,0,0,0.45)",
  padding: "10px 14px",
  borderRadius: 10,
};

const pip = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 180,
  height: 120,
  background: "#000",
  borderRadius: 12,
  overflow: "hidden",
};

const pipVideo = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const pipOff = {
  color: "#fff",
  display: "grid",
  placeItems: "center",
  height: "100%",
};

const participantsBar = {
  position: "absolute",
  right: 16,
  top: 160,
  display: "grid",
  gap: 10,
};

const participant = {
  width: 64,
  height: 64,
  borderRadius: 12,
  background: "#fff",
  display: "grid",
  placeItems: "center",
  fontWeight: 700,
};

const volumeBar = {
  position: "absolute",
  left: 16,
  top: "50%",
  transform: "translateY(-50%)",
};

const volumeSlider = {
  writingMode: "bt-lr",
  WebkitAppearance: "slider-vertical",
  height: 120,
};

const controls = {
  position: "absolute",
  bottom: 24,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 16,
  background: "rgba(0,0,0,0.45)",
  padding: 12,
  borderRadius: 16,
};
