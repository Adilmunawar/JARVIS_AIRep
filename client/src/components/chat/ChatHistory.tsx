import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { MessageItem } from "./MessageItem";
import { AnimatePresence, motion } from "framer-motion";

export function ChatHistory() {
  const { messages, isLoading } = useChat();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6" id="chat-messages">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          {messages.length === 0 && !isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-4 mb-8"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <i className="ri-robot-2-line text-white"></i>
              </div>
              <div className="flex-1">
                <div className="bg-surface rounded-2xl p-4 shadow-sm">
                  <p className="text-gray-200 mb-2">Hello! I'm JARVIS, your advanced AI assistant. How can I help you today?</p>
                  <p className="text-gray-300 text-sm">I can:</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-300">
                    <li className="flex items-center gap-1.5">
                      <i className="ri-chat-1-line text-primary"></i>
                      <span>Answer questions and have natural conversations</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <i className="ri-file-text-line text-primary"></i>
                      <span>Analyze and extract information from documents</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <i className="ri-image-line text-primary"></i>
                      <span>Interpret and describe images</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <i className="ri-code-line text-primary"></i>
                      <span>Help with coding and technical tasks</span>
                    </li>
                  </ul>
                </div>
                <div className="text-xs text-gray-500 mt-1.5 ml-2">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ) : (
            messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-4 mb-8"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <i className="ri-robot-2-line text-white"></i>
              </div>
              <div className="flex-1">
                <div className="bg-surface rounded-2xl px-4 py-3 inline-flex items-center shadow-sm">
                  <div className="typing-indicator flex">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse mx-0.5"></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse mx-0.5" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse mx-0.5" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                  <span className="ml-2 text-sm text-gray-400">JARVIS is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
