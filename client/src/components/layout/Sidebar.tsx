import { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { UserProfile } from "./UserProfile";
import { Link } from "wouter";
import { Conversation } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { conversations, startNewConversation, selectConversation, currentConversationId } = useChat();

  const handleNewChat = () => {
    startNewConversation();
    if (onClose) onClose();
  };

  const handleSelectConversation = (conversation: Conversation) => {
    selectConversation(conversation.id);
    if (onClose) onClose();
  };

  return (
    <aside className={`${isOpen ? 'flex' : 'hidden md:flex'} md:w-64 lg:w-72 flex-col bg-surface border-r border-gray-800 h-full ${isOpen ? 'fixed inset-0 z-20 md:relative' : ''}`}>
      <div className="p-4 flex items-center justify-center border-b border-gray-800">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center relative">
          <div className="absolute top-1/2 left-1/2 w-[80px] h-[80px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 animate-pulse-slow"></div>
          <i className="ri-robot-2-line text-xl text-white"></i>
        </div>
        <Link href="/">
          <h1 className="ml-3 text-xl font-bold text-white cursor-pointer">JARVIS</h1>
        </Link>
        {isOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute right-2 top-4 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <i className="ri-close-line text-xl"></i>
          </Button>
        )}
      </div>
      
      <div className="p-4">
        <Button
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center gap-2 transition duration-200"
          onClick={handleNewChat}
        >
          <i className="ri-add-line"></i>
          <span>New Chat</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        {conversations && conversations.length > 0 && (
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-2">
            Recent conversations
          </div>
        )}
        
        {conversations && conversations.map((conversation) => (
          <div 
            key={conversation.id}
            className={`rounded-lg hover:bg-gray-800/50 mb-1 transition duration-200 ${conversation.id === currentConversationId ? 'bg-gray-800/30' : ''}`}
            onClick={() => handleSelectConversation(conversation)}
          >
            <a className="p-3 flex items-start gap-3 cursor-pointer">
              <i className="ri-message-3-line mt-1 text-gray-400"></i>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-200 truncate">{conversation.title}</h3>
                <p className="text-xs text-gray-400 truncate mt-1">
                  {new Date(conversation.updatedAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </a>
          </div>
        ))}
        
        {(!conversations || conversations.length === 0) && (
          <div className="text-center py-10 text-gray-500">
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Start a new chat to begin</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-800">
        <UserProfile />
      </div>
    </aside>
  );
}
