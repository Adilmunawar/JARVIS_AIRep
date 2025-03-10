import { apiRequest } from "./queryClient";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: This is only for demonstration purposes
});

// Process a text message with the AI
export async function processMessage(message: string, conversationId?: number): Promise<any> {
  const response = await apiRequest("POST", "/api/chat", {
    content: message,
    conversationId,
  });
  
  return response.json();
}

// Process a file with the AI
export async function processFile(
  file: File, 
  message?: string, 
  conversationId?: number
): Promise<any> {
  const formData = new FormData();
  formData.append("files", file);
  
  if (message) {
    formData.append("content", message);
  }
  
  if (conversationId) {
    formData.append("conversationId", conversationId.toString());
  }
  
  const response = await fetch("/api/chat/with-files", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

// Process multiple files 
export async function processFiles(
  files: File[], 
  message: string = '', 
  conversationId?: number
): Promise<any> {
  try {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (message) {
      formData.append('content', message);
    }
    
    if (conversationId) {
      formData.append('conversationId', conversationId.toString());
    }

    const response = await fetch("/api/chat/with-files", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error processing files:', error);
    throw error;
  }
}

// Get file analysis
export async function analyzeDocument(fileId: number): Promise<any> {
  const response = await apiRequest("GET", `/api/files/${fileId}`);
  return response.json();
}

// Client-side text completion using OpenAI (only if needed)
export async function generateTextCompletion(prompt: string): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error('Error generating text completion:', error);
    throw error;
  }
}
