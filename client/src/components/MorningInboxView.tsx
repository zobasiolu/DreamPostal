import React, { useEffect, useState } from "react";
import Header from "./Header";
import PostcardItem from "./PostcardItem";
import { Button } from "@/components/ui/button";
import { Grid } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Postcard } from "@shared/schema";
import { createTrade } from "@/lib/openai";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MorningInboxViewProps {
  userId: number;
  onCreateCollage: () => void;
}

export default function MorningInboxView({ userId, onCreateCollage }: MorningInboxViewProps) {
  const { toast } = useToast();
  
  // Fetch user's most recent postcard
  const { data: userPostcards, isLoading: isLoadingUserPostcards } = useQuery<Postcard[]>({
    queryKey: ['/api/postcards', userId],
  });
  
  // Get the most recent postcard
  const latestPostcard = userPostcards?.[0];
  
  // Fetch postcards for trading
  const { data: tradePostcards, isLoading: isLoadingTradePostcards } = useQuery<Postcard[]>({
    queryKey: ['/api/postcards/trade', userId],
  });
  
  // Trade mutation
  const tradeMutation = useMutation({
    mutationFn: (postcardId: number) => createTrade(userId, 0, postcardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postcards/trade', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/trades', userId] });
      
      toast({
        title: "Postcard Traded",
        description: "You've successfully traded for this dreamcard!",
      });
    }
  });
  
  // Collect mutation
  const collectMutation = useMutation({
    mutationFn: (postcardId: number) => createTrade(0, userId, postcardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postcards/trade', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/postcards', userId] });
      
      toast({
        title: "Postcard Collected",
        description: "This dreamcard has been added to your collection!",
      });
    }
  });
  
  const handleTrade = (postcardId: number) => {
    tradeMutation.mutate(postcardId);
  };
  
  const handleCollect = (postcardId: number) => {
    collectMutation.mutate(postcardId);
  };
  
  return (
    <div className="app-height flex flex-col">
      <Header title="Morning Inbox" showHome={true} showUser={false} />
      
      <div className="flex-1 overflow-auto px-5 pb-5">
        <h2 className="text-lg mb-6 font-medium">Your dream postcard is ready!</h2>
        
        {/* User's Postcard */}
        <div className="mb-8">
          <h3 className="text-xl font-serif mb-3">Last Night's Dreams</h3>
          
          {isLoadingUserPostcards ? (
            <div className="h-64 flex items-center justify-center bg-muted rounded-xl">
              <p>Loading your dreamcard...</p>
            </div>
          ) : latestPostcard ? (
            <PostcardItem 
              postcard={latestPostcard}
              size="large"
              isDetailView={true}
            />
          ) : (
            <div className="h-64 flex items-center justify-center bg-muted rounded-xl">
              <p>No dreamcard available yet. Try recording again tonight!</p>
            </div>
          )}
        </div>
        
        {/* Exchange Postcards */}
        <div>
          <h3 className="text-xl font-serif mb-3">Exchange with Dreamers</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Swipe to browse postcards from other dreamers. Tap to trade or collect.
          </p>
          
          {/* Horizontal Swipe Cards */}
          <div className="swipe-container flex overflow-x-auto pb-4 -mx-5 px-5 space-x-4">
            {isLoadingTradePostcards ? (
              <div className="swipe-item flex-shrink-0 w-72 h-48 flex items-center justify-center bg-muted rounded-xl">
                <p>Loading postcards...</p>
              </div>
            ) : tradePostcards && tradePostcards.length > 0 ? (
              tradePostcards.map(postcard => (
                <div key={postcard.id} className="swipe-item flex-shrink-0 w-72">
                  <PostcardItem 
                    postcard={postcard}
                    showActions={false}
                    showTrade={true}
                    size="small"
                    onTrade={() => handleTrade(postcard.id)}
                    onCollect={() => handleCollect(postcard.id)}
                  />
                </div>
              ))
            ) : (
              <div className="swipe-item flex-shrink-0 w-72 h-48 flex items-center justify-center bg-muted rounded-xl">
                <p>No postcards available for trading right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Collage Button */}
      <div className="p-5">
        <Button 
          onClick={onCreateCollage}
          className="w-full py-3 px-6 gradient-bg text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          <Grid className="h-5 w-5" />
          Create Dream Collage
        </Button>
      </div>
    </div>
  );
}
