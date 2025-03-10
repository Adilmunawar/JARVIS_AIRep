import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { MessageItem } from "./MessageItem";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ChatHistory() {
  const { messages, isLoading } = useChat();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Show button when scrolled up more than 500px from bottom
      const isScrolledUp = container.scrollHeight - container.scrollTop - container.clientHeight > 500;
      setShowScrollButton(isScrolledUp);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Animation variants for messages
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", damping: 12 } }
  };

  const features = [
    { icon: "ri-chat-1-line", text: "Answer questions and have natural conversations" },
    { icon: "ri-file-text-line", text: "Analyze and extract information from documents" },
    { icon: "ri-image-line", text: "Interpret and describe images" },
    { icon: "ri-code-line", text: "Help with coding and technical tasks" },
    { icon: "ri-translate-2", text: "Translate between multiple languages" },
    { icon: "ri-image-edit-line", text: "Generate and edit images from descriptions" }
  ];

  return (
    <div 
      ref={containerRef} 
      className="flex-1 overflow-y-auto px-4 md:px-6 py-6 relative" 
      id="chat-messages"
      style={{ 
        backgroundImage: messages.length === 0 ? "radial-gradient(circle at 50% 50%, rgba(var(--primary), 0.05) 0%, transparent 70%)" : "none",
        backgroundSize: "100% 100%",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {messages.length === 0 && !isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="py-12"
            >
              <motion.div 
                className="w-24 h-24 mx-auto mb-6 relative"
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotateY: { repeat: Infinity, duration: 10, ease: "linear" },
                  scale: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                }}
              >
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-expand-radial"></div>
                <div className="absolute inset-2 rounded-full bg-primary/40 animate-pulse-slow"></div>
                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                  <i className="ri-robot-2-line text-4xl text-white"></i>
                </div>
              </motion.div>
              
              <motion.h2 
                className="text-center text-2xl font-bold mb-2 gradient-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Hello! I'm JARVIS
              </motion.h2>
              
              <motion.p 
                className="text-center text-gray-300 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Your advanced AI assistant powered by GPT-4o and Gemini Pro
              </motion.p>
              
              <motion.div 
                className="glass-card p-6 rounded-xl max-w-2xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                <motion.p variants={childVariants} className="text-gray-200 mb-4">
                  How can I help you today? I can:
                </motion.p>
                
                <motion.ul className="grid grid-cols-1 md:grid-cols-2 gap-3" variants={containerVariants}>
                  {features.map((feature, index) => (
                    <motion.li 
                      key={index}
                      variants={childVariants}
                      className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-white/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <i className={`${feature.icon} text-primary`}></i>
                      </div>
                      <span className="text-sm text-gray-300">{feature.text}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                
                <motion.div 
                  className="mt-6 pt-5 border-t border-gray-800"
                  variants={childVariants}
                >
                  <p className="text-sm text-gray-400">
                    Try asking me questions, uploading images for analysis, or requesting creative content.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div layout>
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-4 mb-8"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center animate-pulse-slow">
                <i className="ri-robot-2-line text-white"></i>
              </div>
              <div className="flex-1">
                <div className="glass-card rounded-2xl px-5 py-4 inline-flex items-center">
                  <div className="typing-indicator flex">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce mx-0.5" style={{ animationDelay: "0.0s" }}></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce mx-0.5" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce mx-0.5" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                  <span className="ml-3 text-sm text-gray-400">JARVIS is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.div
              className="absolute bottom-5 right-5 z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={scrollToBottom}
                className="rounded-full w-10 h-10 bg-primary/90 hover:bg-primary p-0 shadow-lg"
                aria-label="Scroll to bottom"
              >
                <i className="ri-arrow-down-line"></i>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
