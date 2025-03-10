import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-pro'; // 'gemini-pro-vision' for images

if (!API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set. Gemini API will not work properly.');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Generation configuration
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

export interface ChatMessage {
  role: string;
  content: string;
}

/**
 * Handles a chat with previous history and returns a response
 */
export async function chatCompletion(
  messages: ChatMessage[]
): Promise<{text: string; metadata: any}> {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig,
      safetySettings,
    });

    // Format messages for Gemini API
    const history = formatChatHistory(messages.slice(0, -1));
    const lastMessage = messages[messages.length - 1].content;
    
    const startTime = Date.now();
    
    // For new conversations without history
    if (history.length === 0) {
      const result = await model.generateContent(lastMessage);
      const response = result.response;
      const text = response.text();
      
      const processingTime = Date.now() - startTime;
      
      return {
        text,
        metadata: {
          model: MODEL_NAME,
          processingTime
        }
      };
    }
    
    // For conversations with history
    const chat = model.startChat({
      history,
      generationConfig,
      safetySettings,
    });
    
    const result = await chat.sendMessage(lastMessage);
    const response = result.response;
    
    const processingTime = Date.now() - startTime;
    
    return {
      text: response.text(),
      metadata: {
        model: MODEL_NAME,
        processingTime
      }
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(`Gemini API Error: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Analyzes an image and provides a description
 */
export async function analyzeImage(imagePath: string, prompt?: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro-vision',
      generationConfig,
      safetySettings,
    });
    
    const fs = await import('fs');
    const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const defaultPrompt = "Describe this image in detail, including what you see and any important elements.";
    const userPrompt = prompt || defaultPrompt;
    
    const result = await model.generateContent([
      userPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType
        }
      }
    ]);
    
    return result.response.text();
  } catch (error: any) {
    console.error('Gemini Vision API Error:', error);
    throw new Error(`Gemini Vision API Error: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Analyzes a document (text file) and provides a summary/analysis
 */
export async function analyzeDocument(filePath: string): Promise<string> {
  try {
    const fs = await import('fs');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig,
      safetySettings,
    });
    
    const prompt = `Please analyze the following document and provide a detailed summary:
    
    ${fileContent}
    
    Provide key insights, main topics, and important information from this document.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error('Gemini Document Analysis Error:', error);
    throw new Error(`Gemini Document Analysis Error: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Format messages history for Gemini API
 */
function formatChatHistory(messages: ChatMessage[]) {
  return messages.map(message => {
    return {
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }]
    };
  });
}