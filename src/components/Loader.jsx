import { useEffect, useRef, useState } from "react";
import "./Loader.css";

const MESSAGES = [
  "A carregar o teu progresso...",
  "A preparar as tuas matérias...",
  "A sincronizar dados...",
  "A verificar o teu plano...",
  "A reunir os teus exercícios...",
];

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (progressRef.current < 85) {
        progressRef.current = Math.min(85, progressRef.current + Math.random() * 20);
        setProgress(progressRef.current);
      }
    }, 800);

    const messageInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="loader-wrap">
      <div className="loader-content">
        <div className="loader-logo">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12L10 18L20 6"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="pulse-ring"></div>
        </div>

        <div className="loader-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="loader-message">
          <span key={messageIndex} className="message-text fade-in">
            {MESSAGES[messageIndex]}
          </span>
        </div>
      </div>
    </div>
  );
}
