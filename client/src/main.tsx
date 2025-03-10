import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom CSS for animations and styles
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes glow {
    from { opacity: 0.5; }
    to { opacity: 1; }
  }
  
  @keyframes messageIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #1e1e2e;
  }
  ::-webkit-scrollbar-thumb {
    background: #3b82f6;
    border-radius: 3px;
  }
  
  /* Message bubble animation */
  .message-animation {
    animation: messageIn 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
