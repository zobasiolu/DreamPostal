import React, { useState } from "react";
import Header from "./Header";
import DateGrid from "./DateGrid";
import PostcardItem from "./PostcardItem";
import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Postcard } from "@shared/schema";
import { useLocation } from "wouter";

interface LandingViewProps {
  userId: number;
  onLightsOut: () => void;
}

export default function LandingView({ userId, onLightsOut }: LandingViewProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"sleepLog" | "gallery">("sleepLog");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPostcard, setSelectedPostcard] = useState<Postcard | null>(null);
  
  // Fetch user's postcards
  const { data: userPostcards, isLoading } = useQuery<Postcard[]>({
    queryKey: ['/api/postcards', userId],
  });
  
  // Handle date selection from calendar
  const handleDateSelect = (date: Date, postcard?: Postcard) => {
    setSelectedDate(date);
    setSelectedPostcard(postcard || null);
  };
  
  // Switch to gallery view
  const handleGalleryTabClick = () => {
    setLocation("/gallery");
  };
  
  // Render recent postcards
  const renderRecentPostcards = () => {
    if (isLoading) {
      return <p>Loading your postcards...</p>;
    }
    
    if (!userPostcards || userPostcards.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You haven't created any dreamcards yet.</p>
          <p className="mt-2">Tap "Lights Out" to create your first one!</p>
        </div>
      );
    }
    
    return userPostcards.slice(0, 5).map(postcard => (
      <PostcardItem 
        key={postcard.id} 
        postcard={postcard}
        className="mb-5"
      />
    ));
  };
  
  return (
    <div className="app-height flex flex-col">
      <Header />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto px-5 py-3">
        {/* Tabs for Sleep Log and Gallery */}
        <div className="flex border-b border-border mb-6">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === "sleepLog" ? "tab-active text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("sleepLog")}
          >
            Sleep Log
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === "gallery" ? "tab-active text-primary" : "text-muted-foreground"}`}
            onClick={handleGalleryTabClick}
          >
            Gallery
          </button>
        </div>
        
        {/* Sleep Log Content */}
        <div id="sleep-log-content">
          {/* Date Calendar */}
          <DateGrid 
            userId={userId}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
          
          {/* Recent Postcards Section */}
          <h3 className="text-xl font-serif mb-4">Recent Dreamcards</h3>
          <div className="space-y-5">
            {renderRecentPostcards()}
          </div>
        </div>
      </div>
      
      {/* Lights Out Button */}
      <div className="p-5">
        <Button 
          onClick={onLightsOut}
          className="w-full py-8 gradient-bg text-white rounded-xl font-medium text-lg shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition h-auto"
        >
          <Moon className="h-5 w-5" />
          Lights Out
        </Button>
      </div>
    </div>
  );
}
