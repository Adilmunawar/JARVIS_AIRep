import { 
  User, InsertUser, 
  Conversation, InsertConversation,
  Message, InsertMessage,
  File, InsertFile
} from "@shared/schema";

// Extend storage interface with CRUD methods we need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  searchUsers(query: string): Promise<User[]>; // New feature
  
  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, changes: Partial<Conversation>): Promise<Conversation>;
  deleteConversation(id: number): Promise<boolean>;
  searchConversations(query: string): Promise<Conversation[]>; // New feature
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  searchMessages(query: string): Promise<Message[]>; // New feature
  
  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFilesByMessageId(messageId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  
  // Batch operations
  getUsersByIds(ids: number[]): Promise<User[]>; // New feature
}

// Basic logger
function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private files: Map<number, File>;
  
  private userIdCounter: number;
  private conversationIdCounter: number;
  private messageIdCounter: number;
  private fileIdCounter: number;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.files = new Map();
    
    this.userIdCounter = 1;
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
    this.fileIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = this.users.get(id);
      if (!user) throw new Error(`User with id ${id} not found`);
      return user;
    } catch (error) {
      log(error.message);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return Array.from(this.users.values()).find(
        (user) => user.username === username,
      );
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      return Array.from(this.users.values()).find(
        (user) => user.email === email,
      );
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    try {
      return Array.from(this.users.values()).find(
        (user) => user.googleId === googleId,
      );
    } catch (error) {
      log(error.message);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      if (!insertUser.username || !insertUser.email) {
        throw new Error("Username and Email are required");
      }
      const id = this.userIdCounter++;
      const user: User = { 
        ...insertUser, 
        id,
        pictureUrl: insertUser.pictureUrl || null
      };
      this.users.set(id, user);
      log(`User created with id ${id}`);
      return user;
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async searchUsers(query: string): Promise<User[]> {
    try {
      return Array.from(this.users.values()).filter(
        (user) => user.username.includes(query) || user.email.includes(query)
      );
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    try {
      const conversation = this.conversations.get(id);
      if (!conversation) throw new Error(`Conversation with id ${id} not found`);
      return conversation;
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    try {
      return Array.from(this.conversations.values())
        .filter((conversation) => conversation.userId === userId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    try {
      const id = this.conversationIdCounter++;
      const now = new Date();
      const conversation: Conversation = { 
        ...insertConversation, 
        id,
        createdAt: now,
        updatedAt: now
      };
      this.conversations.set(id, conversation);
      log(`Conversation created with id ${id}`);
      return conversation;
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async updateConversation(id: number, changes: Partial<Conversation>): Promise<Conversation> {
    try {
      const conversation = this.conversations.get(id);
      if (!conversation) throw new Error(`Conversation with id ${id} not found`);
      
      const updatedConversation = { ...conversation, ...changes };
      this.conversations.set(id, updatedConversation);
      log(`Conversation with id ${id} updated`);
      return updatedConversation;
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async deleteConversation(id: number): Promise<boolean> {
    try {
      const deleted = this.conversations.delete(id);
      if (!deleted) throw new Error(`Conversation with id ${id} not found`);
      log(`Conversation with id ${id} deleted`);
      return deleted;
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async searchConversations(query: string): Promise<Conversation[]> {
    try {
      return Array.from(this.conversations.values()).filter(
        (conversation) => conversation.title.includes(query) || conversation.description.includes(query)
      );
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    try {
      const message = this.messages.get(id);
      if (!message) throw new Error(`Message with id ${id} not found`);
      return message;
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    try {
      return Array.from(this.messages.values())
        .filter((message) => message.conversationId === conversationId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      const id = this.messageIdCounter++;
      const message: Message = { 
        ...insertMessage, 
        id,
        timestamp: new Date(),
        metadata: insertMessage.metadata || null
      };
      this.messages.set(id, message);
      log(`Message created with id ${id}`);
      return message;
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async searchMessages(query: string): Promise<Message[]> {
    try {
      return Array.from(this.messages.values()).filter(
        (message) => message.content.includes(query)
      );
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  // File operations
  async getFile(id: number): Promise<File | undefined> {
    try {
      const file = this.files.get(id);
      if (!file) throw new Error(`File with id ${id} not found`);
      return file;
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async getFilesByMessageId(messageId: number): Promise<File[]> {
    try {
      return Array.from(this.files.values())
        .filter((file) => file.messageId === messageId);
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  async createFile(insertFile: InsertFile): Promise<File> {
    try {
      const id = this.fileIdCounter++;
      const file: File = { 
        ...insertFile, 
        id,
        createdAt: new Date()
      };
      this.files.set(id, file);
      log(`File created with id ${id}`);
      return file;
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
  
  // Batch operations
  async getUsersByIds(ids: number[]): Promise<User[]> {
    try {
      return ids.map(id => this.users.get(id)).filter(user => user !== undefined) as User[];
    } catch (error) {
      log(error.message);
      throw error;
    }
  }
}

export const storage = new MemStorage();
