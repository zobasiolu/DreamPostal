import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateCaptionFromAudio, generateImageFromCaption } from "./openai";
import { insertPostcardSchema, insertTradeSchema } from "@shared/schema";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Get current user's postcards
  app.get("/api/postcards", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const postcards = await storage.getPostcardsByUserId(userId);
      res.json(postcards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching postcards" });
    }
  });
  
  // Get public/trending postcards for gallery
  app.get("/api/postcards/public", async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const publicPostcards = await storage.getPublicPostcards(limit);
      res.json(publicPostcards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching public postcards" });
    }
  });
  
  // Get a single postcard by ID
  app.get("/api/postcards/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid postcard ID" });
      }
      
      const postcard = await storage.getPostcard(id);
      if (!postcard) {
        return res.status(404).json({ message: "Postcard not found" });
      }
      
      res.json(postcard);
    } catch (error) {
      res.status(500).json({ message: "Error fetching postcard" });
    }
  });
  
  // Get random postcards for trading
  app.get("/api/postcards/trade/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const count = Number(req.query.count) || 2;
      const postcards = await storage.getRandomPostcardsForTrade(userId, count);
      res.json(postcards);
    } catch (error) {
      res.status(500).json({ message: "Error fetching postcards for trade" });
    }
  });
  
  // Record sleep audio and create a postcard
  app.post("/api/record", async (req: Request, res: Response) => {
    try {
      const { userId, audioData } = req.body;
      
      if (!userId || !audioData) {
        return res.status(400).json({ message: "Missing required data" });
      }
      
      // Update user's last sleep time
      await storage.updateUserLastSleep(userId);
      
      // Generate a hash for the audio
      const audioHash = crypto
        .createHash("md5")
        .update(audioData)
        .digest("hex");
      
      // Generate caption from audio
      const caption = await generateCaptionFromAudio(audioData);
      
      // Generate image from caption
      const imgURL = await generateImageFromCaption(caption);
      
      // Create the postcard in storage
      const postcardData = {
        userId,
        audioHash,
        imgURL,
        caption,
        isPublic: 1
      };
      
      const validateResult = insertPostcardSchema.safeParse(postcardData);
      if (!validateResult.success) {
        return res.status(400).json({ message: "Invalid postcard data", errors: validateResult.error });
      }
      
      const newPostcard = await storage.createPostcard(postcardData);
      res.status(201).json(newPostcard);
    } catch (error) {
      console.error("Error creating postcard:", error);
      res.status(500).json({ message: "Error creating postcard" });
    }
  });
  
  // Like a postcard
  app.post("/api/postcards/:id/like", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid postcard ID" });
      }
      
      const postcard = await storage.likePostcard(id);
      if (!postcard) {
        return res.status(404).json({ message: "Postcard not found" });
      }
      
      res.json(postcard);
    } catch (error) {
      res.status(500).json({ message: "Error liking postcard" });
    }
  });
  
  // Create a trade between users
  app.post("/api/trades", async (req: Request, res: Response) => {
    try {
      const { fromId, toId, postcardId } = req.body;
      
      const tradeData = { fromId, toId, postcardId };
      
      const validateResult = insertTradeSchema.safeParse(tradeData);
      if (!validateResult.success) {
        return res.status(400).json({ message: "Invalid trade data", errors: validateResult.error });
      }
      
      const newTrade = await storage.createTrade(tradeData);
      res.status(201).json(newTrade);
    } catch (error) {
      res.status(500).json({ message: "Error creating trade" });
    }
  });
  
  // Get trades for a user
  app.get("/api/trades/:userId", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const trades = await storage.getTradesByUserId(userId);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: "Error fetching trades" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
