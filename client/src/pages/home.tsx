import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { ChatInput } from "@/components/chat/ChatInput";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { AuthOverlay } from "@/components/auth/AuthOverlay";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const { user, isInitializing } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  
  useEffect(() => {
    // Small delay for smoother initial loading animation
    const timer = setTimeout(() => {
      setIsAppLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Don't show anything while checking auth status
  if (!isAppLoaded || isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center relative">
          <div className="absolute top-1/2 left-1/2 w-[80px] h-[80px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 animate-pulse-slow"></div>
          <i className="ri-robot-2-line text-3xl text-white"></i>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      className="flex h-screen overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative md:pt-0 pt-14">
        <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <ChatHistory />
        <ChatInput />
      </main>
      
      <AnimatePresence>
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AuthOverlay />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
