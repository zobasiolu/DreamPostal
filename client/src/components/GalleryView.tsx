import React, { useState } from "react";
import Header from "./Header";
import PostcardItem from "./PostcardItem";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Postcard } from "@shared/schema";

interface GalleryViewProps {
  userId: number;
}

export default function GalleryView({ userId }: GalleryViewProps) {
  const [activeCategory, setActiveCategory] = useState("trending");
  
  // Fetch public postcards
  const { data: publicPostcards, isLoading } = useQuery<Postcard[]>({
    queryKey: ['/api/postcards/public'],
  });
  
  // Define available categories
  const categories = [
    { id: "trending", label: "Trending" },
    { id: "recent", label: "Recent" },
    { id: "surreal", label: "Surreal" },
    { id: "nature", label: "Nature" },
    { id: "abstract", label: "Abstract" }
  ];
  
  // Filter postcards by category (simplified implementation)
  const filteredPostcards = React.useMemo(() => {
    if (!publicPostcards) return [];
    
    switch (activeCategory) {
      case "recent":
        // Sort by date, newest first
        return [...publicPostcards].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "trending":
      default:
        // Sort by likes, most liked first (default)
        return [...publicPostcards].sort((a, b) => b.likes - a.likes);
    }
  }, [publicPostcards, activeCategory]);
  
  return (
    <div className="app-height flex flex-col">
      <Header title="Dream Gallery" showHome={true} showUser={false} />
      
      <div className="flex-1 overflow-auto px-5 pb-5">
        {/* Gallery Categories */}
        <div className="flex overflow-x-auto space-x-2 py-2 mb-4">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className={`whitespace-nowrap ${
                activeCategory === category.id 
                  ? "bg-primary text-white" 
                  : "bg-muted dark:bg-card"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>
        
        {/* Gallery Grid */}
        {isLoading ? (
          <div className="py-10 text-center">
            <p>Loading gallery...</p>
          </div>
        ) : filteredPostcards.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {filteredPostcards.map(postcard => (
              <PostcardItem
                key={postcard.id}
                postcard={postcard}
                size="small"
                showActions={false}
                showLikes={true}
                showUsername={true}
              />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p>No postcards found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
