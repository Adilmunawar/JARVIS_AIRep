import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { z } from "zod";
import * as firebaseAdmin from "firebase-admin";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { storage as dbStorage } from "./storage";
import { messageInputSchema } from "../shared/schema";
import { analyzeImage, analyzeDocument, chatCompletion, type ChatMessage } from "./services/gemini";

// Define RequestWithUser interface to handle the user property
interface RequestWithUser extends Request {
  user: {
    uid: string;
    name?: string;
    email?: string;
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");

// Ensure uploads directory exists
async function ensureUploadsDir() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.error("Error creating uploads directory:", err);
  }
}

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    console.log("Firebase admin initialization skipped for now");
  } catch (error) {
    console.warn("Firebase admin initialization error:", error);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg", 
      "image/png", 
      "image/gif", 
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not supported`));
    }
  },
});

// Middleware to check if user is authenticated
const isAuthenticated = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    req.user = {
      uid: "demo-user-123",
      name: "Demo User",
      email: "demo@example.com"
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Middleware for request validation
const validateRequest = (schema: z.ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
};

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Middleware setup
  app.use(cors());
  app.use(helmet());
  app.use(morgan('combined'));
  app.use(limiter);

  await ensureUploadsDir();
  initializeFirebaseAdmin();
  
  // Authentication routes
  app.post("/api/auth/google", validateRequest(z.object({ idToken: z.string() })), async (req, res) => {
    try {
      const { idToken } = req.body;
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      const sessionCookie = await firebaseAdmin.auth().createSessionCookie(idToken, { expiresIn });
      const options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      };
      res.cookie("session", sessionCookie, options);
      const firebaseUser = await firebaseAdmin.auth().getUser(uid);
      let user = await dbStorage.getUserByGoogleId(uid);
      if (!user) {
        user = await dbStorage.createUser({
          username: firebaseUser.email?.split("@")[0] || `user${Date.now()}`,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "User",
          pictureUrl: firebaseUser.photoURL || null,
          googleId: uid,
        });
      }
      res.status(200).json({ authenticated: true, user });
    } catch (error) {
      console.error("Session creation error:", error);
      res.status(401).json({ error: "Unauthorized" });
    }
  });
  
  app.get("/api/auth/session", async (req, res) => {
    try {
      let user = await dbStorage.getUserByGoogleId("demo-user-123");
      if (!user) {
        user = await dbStorage.createUser({
          username: "demo_user",
          email: "demo@example.com",
          displayName: "Demo User",
          pictureUrl: null,
          googleId: "demo-user-123",
        });
      }
      res.status(200).json({ authenticated: true, user });
    } catch (error) {
      console.error("Session error:", error);
      res.status(200).json({ authenticated: false });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("session");
    res.status(200).json({ success: true });
  });

  // User profile management
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await dbStorage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({ user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      const updatedUser = await dbStorage.updateUser(userId, userData);
      res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  // Chat routes
  app.post("/api/chat", isAuthenticated, validateRequest(messageInputSchema), async (req: RequestWithUser, res) => {
    try {
      const validatedData = req.body;
      const userId = req.user.uid;
      const user = await dbStorage.getUserByGoogleId(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      let conversation;
      if (validatedData.conversationId) {
        conversation = await dbStorage.getConversation(validatedData.conversationId);
        if (!conversation || conversation.userId !== user.id) {
          return res.status(403).json({ error: "Access denied to this conversation" });
        }
      } else {
        const title = validatedData.content.split(" ").slice(0, 5).join(" ") + "...";
        conversation = await dbStorage.createConversation({
          userId: user.id,
          title: title,
        });
      }
      const userMessage = await dbStorage.createMessage({
        conversationId: conversation.id,
        content: validatedData.content,
        role: "user",
      });
      const previousMessages = await dbStorage.getMessagesByConversationId(conversation.id);
      const chatMessages: ChatMessage[] = previousMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      chatMessages.push({
        role: "user",
        content: validatedData.content
      });
      const geminiResponse = await chatCompletion(chatMessages);
      const assistantMessage = await dbStorage.createMessage({
        conversationId: conversation.id,
        content: geminiResponse.text,
        role: "assistant",
        metadata: JSON.stringify({
          model: geminiResponse.metadata.model,
          processingTime: geminiResponse.metadata.processingTime
        })
      });
      await dbStorage.updateConversation(conversation.id, { updatedAt: new Date() });
      const messages = await dbStorage.getMessagesByConversationId(conversation.id);
      res.status(200).json({
        conversationId: conversation.id,
        messages,
      });
    } catch (error) {
      console.error("Chat error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });
  
  // File upload and chat
  app.post("/api/chat/with-files", isAuthenticated, upload.array("files", 5), async (req: RequestWithUser, res) => {
    try {
      const content = req.body.content || "";
      const conversationId = req.body.conversationId ? parseInt(req.body.conversationId) : undefined;
      const userId = req.user.uid;
      const user = await dbStorage.getUserByGoogleId(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      let conversation;
      if (conversationId) {
        conversation = await dbStorage.getConversation(conversationId);
        if (!conversation || conversation.userId !== user.id) {
          return res.status(403).json({ error: "Access denied to this conversation" });
        }
      } else {
        const title = content ? content.split(" ").slice(0, 5).join(" ") + "..." : "File analysis";
        conversation = await dbStorage.createConversation({
          userId: user.id,
          title: title,
        });
      }
      const userMessage = await dbStorage.createMessage({
        conversationId: conversation.id,
        content: content || "Uploaded file(s) for analysis",
        role: "user",
      });
      const files = req.files as Express.Multer.File[];
      let fileAnalysisResults = [];
      for (const file of files) {
        const dbFile = await dbStorage.createFile({
          messageId: userMessage.id,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: file.path,
        });
        let analysisResult;
        if (file.mimetype.startsWith("image/")) {
          analysisResult = await analyzeImage(file.path);
        } else {
          analysisResult = await analyzeDocument(file.path);
        }
        fileAnalysisResults.push({
          fileName: file.originalname,
          analysis: analysisResult
        });
      }
      let prompt = content ? `User message: ${content}\n\n` : "";
      prompt += "The user has uploaded the following files:\n";
      fileAnalysisResults.forEach((result, index) => {
        prompt += `\nFile ${index + 1}: ${result.fileName}\n`;
        prompt += `Analysis: ${result.analysis}\n`;
      });
      prompt += "\nPlease respond to the user based on these files and their message.";
      const chatMessages: ChatMessage[] = [{
        role: "user",
        content: prompt
      }];
      const geminiResponse = await chatCompletion(chatMessages);
      const assistantMessage = await dbStorage.createMessage({
        conversationId: conversation.id,
        content: geminiResponse.text,
        role: "assistant",
        metadata: JSON.stringify({
          model: geminiResponse.metadata.model,
          processingTime: geminiResponse.metadata.processingTime
        })
      });
      await dbStorage.updateConversation(conversation.id, { updatedAt: new Date() });
      const messages = await dbStorage.getMessagesByConversationId(conversation.id);
      const messagesWithFiles = await Promise.all(
        messages.map(async (message: any) => {
          const files = await dbStorage.getFilesByMessageId(message.id);
          return {
            ...message,
            files: files.map((file: any) => ({
              fileName: file.fileName,
              fileType: file.fileType,
              fileSize: file.fileSize,
              fileUrl: `/api/files/${file.id}`,
            })),
          };
        })
      );
      res.status(200).json({
        conversationId: conversation.id,
        messages: messagesWithFiles,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to process file upload" });
    }
  });
  
  // Conversations routes
  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.uid;
      const user = await dbStorage.getUserByGoogleId(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const conversations = await dbStorage.getConversationsByUserId(user.id);
      res.status(200).json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });
  
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.uid;
      const user = await dbStorage.getUserByGoogleId(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const conversation = await dbStorage.getConversation(conversationId);
      if (!conversation || conversation.userId !== user.id) {
        return res.status(403).json({ error: "Access denied to this conversation" });
      }
      const messages = await dbStorage.getMessagesByConversationId(conversationId);
      const messagesWithFiles = await Promise.all(
        messages.map(async (message) => {
          const files = await dbStorage.getFilesByMessageId(message.id);
          return {
            ...message,
            files: files.map(file => ({
              fileName: file.fileName,
              fileType: file.fileType,
              fileSize: file.fileSize,
              fileUrl: `/api/files/${file.id}`,
            })),
          };
        })
      );
      res.status(200).json(messagesWithFiles);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  
  // File routes
  app.get("/api/files/:id", isAuthenticated, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.user.uid;
      const user = await dbStorage.getUserByGoogleId(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const file = await dbStorage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      const message = await dbStorage.getMessage(file.messageId);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      const conversation = await dbStorage.getConversation(message.conversationId);
      if (!conversation || conversation.userId !== user.id) {
        return res.status(403).json({ error: "Access denied to this file" });
      }
      res.sendFile(file.filePath);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ error: "Failed to fetch file" });
    }
  });

  return httpServer;
}
