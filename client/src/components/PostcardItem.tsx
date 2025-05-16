import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share, Download, HeartCrack } from "lucide-react";
import type { Postcard } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { likePostcard } from "@/lib/openai";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface PostcardItemProps {
  postcard: Postcard;
  showActions?: boolean;
  showTrade?: boolean;
  onTrade?: () => void;
  onCollect?: () => void;
  className?: string;
  showUsername?: boolean;
  showLikes?: boolean;
  isDetailView?: boolean;
  size?: "small" | "medium" | "large";
}

export default function PostcardItem({
  postcard,
  showActions = true,
  showTrade = false,
  onTrade,
  onCollect,
  className = "",
  showUsername = false,
  showLikes = false,
  isDetailView = false,
  size = "medium"
}: PostcardItemProps) {
  const [liked, setLiked] = React.useState(false);
  
  // Setup like mutation
  const likeMutation = useMutation({
    mutationFn: () => likePostcard(postcard.id),
    onSuccess: () => {
      setLiked(true);
      queryClient.invalidateQueries({ queryKey: ['/api/postcards/public'] });
      queryClient.invalidateQueries({ queryKey: ['/api/postcards', postcard.userId] });
    }
  });
  
  // Format created date
  const formattedDate = formatDistanceToNow(new Date(postcard.createdAt), { addSuffix: true });
  
  // Image height based on size
  const getImageHeight = () => {
    switch (size) {
      case "small": return "h-40";
      case "large": return "h-64";
      default: return "h-48";
    }
  };
  
  // Caption text size based on size
  const getCaptionSize = () => {
    switch (size) {
      case "small": return "text-sm";
      case "large": return "text-lg";
      default: return "text-base";
    }
  };
  
  const handleLike = () => {
    if (!liked) {
      likeMutation.mutate();
    }
  };
  
  return (
    <Card className={`postcard overflow-hidden shadow-md hover:shadow-lg transition ${className}`}>
      <div className="relative">
        <img 
          src={postcard.imgURL} 
          alt="Dream postcard" 
          className={`w-full ${getImageHeight()} object-cover`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <p className={`absolute bottom-3 left-3 right-3 text-white font-serif italic ${getCaptionSize()} postcard-caption`}>
          {postcard.caption}
        </p>
      </div>
      
      <CardFooter className="p-3 bg-white dark:bg-card">
        {showTrade ? (
          <div className="flex justify-between items-center w-full">
            <span className="text-xs">From: @username</span>
            <div className="flex gap-2">
              <Button 
                size="sm"
                className="px-3 py-1 text-xs rounded-full bg-primary text-white"
                onClick={onTrade}
              >
                Trade
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="px-3 py-1 text-xs rounded-full border-primary text-primary"
                onClick={onCollect}
              >
                Collect
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-muted-foreground">
                {showUsername ? '@username' : formattedDate}
              </span>
              
              {showActions && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Share className="h-4 w-4" />
                  </Button>
                  
                  {isDetailView ? (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      onClick={handleLike}
                      disabled={liked || likeMutation.isPending}
                    >
                      {liked ? <HeartCrack className="h-4 w-4 text-red-500" /> : <Heart className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              )}
              
              {showLikes && (
                <div className="flex items-center">
                  <HeartCrack className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs">{postcard.likes}</span>
                </div>
              )}
            </div>
            
            {isDetailView && (
              <div className="flex justify-between items-center w-full mt-2">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">8.2 hrs sleep</span>
                </div>
                <Button size="sm" variant="link" className="text-xs text-primary p-0 h-auto">
                  View in Gallery
                </Button>
              </div>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
