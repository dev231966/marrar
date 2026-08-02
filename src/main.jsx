
window.onerror = function (mensagem, origem, linha, coluna, erro) {
  const div = document.createElement("div");
  div.style.cssText =
    "position:fixed;top:0;left:0;right:0;z-index:99999;background:#B00020;color:#fff;padding:16px;font-family:monospace;font-size:13px;white-space:pre-wrap;max-height:80vh;overflow:auto;";
  div.textContent = `ERRO: ${mensagem}\nFicheiro: ${origem}\nLinha: ${linha}:${coluna}\n\nStack:\n${erro?.stack || "(sem stack)"}`;
  document.body.appendChild(div);
};

window.addEventListener("unhandledrejection", function (event) {
  const div = document.createElement("div");
  div.style.cssText =
    "position:fixed;top:0;left:0;right:0;z-index:99999;background:#B00020;color:#fff;padding:16px;font-family:monospace;font-size:13px;white-space:pre-wrap;max-height:80vh;overflow:auto;";
  div.textContent = `PROMISE REJEITADA: ${event.reason?.message || event.reason}\n\nStack:\n${event.reason?.stack || "(sem stack)"}`;
  document.body.appendChild(div);
});


import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './App.css';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
