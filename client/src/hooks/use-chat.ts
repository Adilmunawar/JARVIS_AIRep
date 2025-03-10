import { useContext, useState } from 'react';
import { ChatContext } from '@/context/ChatContext';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Message } from '@shared/schema';

export function useChat() {
  const context = useContext(ChatContext);
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  const sendMessage = async (content: string, files?: File[], model?: string) => {
    if (!content.trim() && (!files || files.length === 0)) return;
    
    try {
      context.setIsSending(true);
      
      let response;
      
      if (files && files.length > 0) {
        setIsUploading(true);
        
        // Create a FormData object to upload files
        const formData = new FormData();
        formData.append('content', content);
        
        if (context.currentConversationId) {
          formData.append('conversationId', context.currentConversationId.toString());
        }
        
        // Add model selection if provided
        if (model) {
          formData.append('model', model);
        }
        
        // Attach files
        files.forEach(file => {
          formData.append('files', file);
        });
        
        // Send request with files
        const uploadResponse = await fetch('/api/chat/with-files', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`);
        }
        
        response = await uploadResponse.json();
        setIsUploading(false);
      } else {
        // Simple text message
        const apiResponse = await apiRequest('POST', '/api/chat', {
          content,
          conversationId: context.currentConversationId,
          model: model || 'gpt-4o', // Default to GPT-4o if not specified
        });
        
        response = await apiResponse.json();
      }
      
      // If this is a new conversation, we need to update the conversation list
      if (!context.currentConversationId && response.conversationId) {
        context.setCurrentConversationId(response.conversationId);
        queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      }
      
      // Update messages
      if (response.messages) {
        context.setMessages(response.messages);
      }
      
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      context.setIsSending(false);
      setIsUploading(false);
    }
  };
  
  const startNewConversation = () => {
    context.setCurrentConversationId(undefined);
    context.setMessages([]);
  };
  
  const selectConversation = async (conversationId: number) => {
    try {
      context.setIsLoading(true);
      context.setCurrentConversationId(conversationId);
      
      const response = await apiRequest('GET', `/api/conversations/${conversationId}/messages`);
      const messages = await response.json();
      
      context.setMessages(messages);
    } catch (error) {
      console.error('Error selecting conversation:', error);
    } finally {
      context.setIsLoading(false);
    }
  };
  
  return {
    messages: context.messages,
    conversations: context.conversations,
    currentConversationId: context.currentConversationId,
    isLoading: context.isLoading,
    isSending: context.isSending,
    isUploading,
    sendMessage,
    startNewConversation,
    selectConversation,
  };
}
