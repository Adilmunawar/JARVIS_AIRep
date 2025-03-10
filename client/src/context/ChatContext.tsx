import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Message, Conversation } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

interface ChatContextType {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  currentConversationId?: number;
  setCurrentConversationId: (id?: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isSending: boolean;
  setIsSending: (sending: boolean) => void;
}

const defaultContext: ChatContextType = {
  messages: [],
  setMessages: () => {},
  conversations: [],
  setConversations: () => {},
  setCurrentConversationId: () => {},
  isLoading: false,
  setIsLoading: () => {},
  isSending: false,
  setIsSending: () => {},
};

export const ChatContext = createContext<ChatContextType>(defaultContext);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Fetch conversations
  const { data: conversationsData } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    enabled: true,
  });

  // Update conversations when data changes
  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
    }
  }, [conversationsData]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        conversations,
        setConversations,
        currentConversationId,
        setCurrentConversationId,
        isLoading,
        setIsLoading,
        isSending,
        setIsSending,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
