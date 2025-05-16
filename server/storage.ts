import { 
  users, type User, type InsertUser,
  postcards, type Postcard, type InsertPostcard,
  trades, type Trade, type InsertTrade
} from "@shared/schema";

// interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastSleep(id: number): Promise<User | undefined>;
  
  // Postcard operations
  getPostcard(id: number): Promise<Postcard | undefined>;
  getPostcardsByUserId(userId: number): Promise<Postcard[]>;
  getPublicPostcards(limit?: number): Promise<Postcard[]>;
  createPostcard(postcard: InsertPostcard): Promise<Postcard>;
  likePostcard(id: number): Promise<Postcard | undefined>;
  
  // Trade operations
  createTrade(trade: InsertTrade): Promise<Trade>;
  getTradesByUserId(userId: number): Promise<Trade[]>;
  getRandomPostcardsForTrade(userId: number, count?: number): Promise<Postcard[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private postcards: Map<number, Postcard>;
  private trades: Map<number, Trade>;
  private currentUserId: number;
  private currentPostcardId: number;
  private currentTradeId: number;

  constructor() {
    this.users = new Map();
    this.postcards = new Map();
    this.trades = new Map();
    this.currentUserId = 1;
    this.currentPostcardId = 1;
    this.currentTradeId = 1;
    
    // Add initial demo data
    this.createInitialData();
  }

  private createInitialData() {
    // Sample users
    const user1: User = {
      id: this.currentUserId++,
      username: "dreamweaver",
      password: "hashed_password",
      timezone: "America/New_York",
      lastSleepAt: new Date(),
    };
    this.users.set(user1.id, user1);
    
    const user2: User = {
      id: this.currentUserId++,
      username: "nightwalker",
      password: "hashed_password",
      timezone: "Europe/London",
      lastSleepAt: new Date(),
    };
    this.users.set(user2.id, user2);
    
    // Sample postcards
    const postcard1: Postcard = {
      id: this.currentPostcardId++,
      userId: user1.id,
      audioHash: "sample_hash_1",
      imgURL: "https://images.unsplash.com/photo-1499678329028-101435549a4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      caption: "Whispers of midnight lavender, where dreams cascade like purple rain",
      createdAt: new Date(),
      isPublic: 1,
      likes: 42,
    };
    this.postcards.set(postcard1.id, postcard1);
    
    const postcard2: Postcard = {
      id: this.currentPostcardId++,
      userId: user2.id,
      audioHash: "sample_hash_2",
      imgURL: "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      caption: "Crystal whispers echo through caves of forgotten memories, time suspended in amber light",
      createdAt: new Date(),
      isPublic: 1,
      likes: 87,
    };
    this.postcards.set(postcard2.id, postcard2);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, lastSleepAt: null };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserLastSleep(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { 
      ...user, 
      lastSleepAt: new Date() 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Postcard operations
  async getPostcard(id: number): Promise<Postcard | undefined> {
    return this.postcards.get(id);
  }

  async getPostcardsByUserId(userId: number): Promise<Postcard[]> {
    return Array.from(this.postcards.values()).filter(
      (postcard) => postcard.userId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPublicPostcards(limit: number = 20): Promise<Postcard[]> {
    return Array.from(this.postcards.values())
      .filter((postcard) => postcard.isPublic === 1)
      .sort((a, b) => b.likes - a.likes || b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createPostcard(insertPostcard: InsertPostcard): Promise<Postcard> {
    const id = this.currentPostcardId++;
    const postcard: Postcard = { 
      ...insertPostcard, 
      id, 
      createdAt: new Date(),
      likes: 0,
    };
    this.postcards.set(id, postcard);
    return postcard;
  }
  
  async likePostcard(id: number): Promise<Postcard | undefined> {
    const postcard = await this.getPostcard(id);
    if (!postcard) return undefined;
    
    const updatedPostcard: Postcard = { 
      ...postcard, 
      likes: postcard.likes + 1 
    };
    this.postcards.set(id, updatedPostcard);
    return updatedPostcard;
  }

  // Trade operations
  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = this.currentTradeId++;
    const trade: Trade = { 
      ...insertTrade, 
      id, 
      createdAt: new Date() 
    };
    this.trades.set(id, trade);
    return trade;
  }

  async getTradesByUserId(userId: number): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(
      (trade) => trade.fromId === userId || trade.toId === userId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getRandomPostcardsForTrade(userId: number, count: number = 2): Promise<Postcard[]> {
    // Get public postcards not belonging to the user
    const availablePostcards = Array.from(this.postcards.values())
      .filter(postcard => postcard.userId !== userId && postcard.isPublic === 1);
    
    // Shuffle array
    for (let i = availablePostcards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePostcards[i], availablePostcards[j]] = [availablePostcards[j], availablePostcards[i]];
    }
    
    return availablePostcards.slice(0, count);
  }
}

export const storage = new MemStorage();
