import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "" 
});

// Basic chat completion
export async function chatCompletion(prompt: string): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are JARVIS, an advanced AI assistant. You provide helpful, accurate, and concise responses. Format your responses using markdown when appropriate for better readability, such as using proper headings, lists, code blocks with syntax highlighting, etc."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "I'm sorry, I encountered an error processing your request. Please try again later.";
  }
}

// Analyze an image
export async function analyzeImage(imagePath: string): Promise<string> {
  try {
    // Read the image as base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString("base64");
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this image in detail. Describe what you see, identify key elements, and provide any relevant insights."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 800,
    });

    return response.choices[0].message.content || "I couldn't analyze the image.";
  } catch (error) {
    console.error("Image analysis error:", error);
    return "I encountered an error analyzing this image.";
  }
}

// Analyze a document
export async function analyzeDocument(filePath: string): Promise<string> {
  try {
    // Read file content as text or base64 based on file type
    const fileExt = path.extname(filePath).toLowerCase();
    let fileContent: string;
    let fileType: string;
    
    if (fileExt === '.pdf' || fileExt === '.doc' || fileExt === '.docx' || fileExt === '.xls' || fileExt === '.xlsx') {
      // For binary files, convert to base64
      const fileBuffer = await fs.readFile(filePath);
      fileContent = fileBuffer.toString('base64');
      fileType = "binary";
    } else {
      // For text files, read as UTF-8
      fileContent = await fs.readFile(filePath, 'utf-8');
      fileType = "text";
    }
    
    // For now, we'll simulate document analysis since we can't directly submit
    // binary documents to the API without additional processing
    let analysisPrompt = "";
    
    if (fileType === "text") {
      analysisPrompt = `The following is the content of a document. Please analyze it and provide a comprehensive summary:\n\n${fileContent}`;
    } else {
      // For binary files, we'll need to tell the user we can't process them fully
      analysisPrompt = `I've received a ${fileExt.substring(1).toUpperCase()} file. Since I cannot directly read the binary content, please tell the user that I've received their document but can only analyze its content if they have specific questions about it.`;
    }
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert document analyst. Provide a detailed analysis of the document content."
        },
        { role: "user", content: analysisPrompt }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "I couldn't analyze the document.";
  } catch (error) {
    console.error("Document analysis error:", error);
    return "I encountered an error analyzing this document.";
  }
}
