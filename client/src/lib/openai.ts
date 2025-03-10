import { apiRequest } from "./queryClient";

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
  formData.append("file", file);
  
  if (message) {
    formData.append("message", message);
  }
  
  if (conversationId) {
    formData.append("conversationId", conversationId.toString());
  }
  
  const response = await fetch("/api/upload", {
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

// Get file analysis
export async function analyzeDocument(fileId: number): Promise<any> {
  const response = await apiRequest("GET", `/api/analyze/${fileId}`);
  return response.json();
}
