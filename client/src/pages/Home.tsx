import React, { useState } from "react";
import LandingView from "@/components/LandingView";
import LightsOutView from "@/components/LightsOutView";
import MorningInboxView from "@/components/MorningInboxView";
import { useToast } from "@/hooks/use-toast";

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = 1;

export default function Home() {
  const [currentView, setCurrentView] = useState<"landing" | "lightsOut" | "inbox">("landing");
  const { toast } = useToast();
  
  // Handle Lights Out button click
  const handleLightsOut = () => {
    setCurrentView("lightsOut");
  };
  
  // Handle cancel from Lights Out view
  const handleLightsOutCancel = () => {
    setCurrentView("landing");
  };
  
  // Handle completion of recording
  const handleRecordingComplete = () => {
    setCurrentView("inbox");
    toast({
      title: "Dreamcard Created",
      description: "Your sleep sounds have been transformed into a dreamcard!",
    });
  };
  
  // Handle collage creation
  const handleCreateCollage = () => {
    toast({
      title: "Collage Creation",
      description: "This feature is coming soon!",
    });
  };
  
  // Render appropriate view based on state
  return (
    <>
      {currentView === "landing" && (
        <LandingView 
          userId={DEMO_USER_ID} 
          onLightsOut={handleLightsOut} 
        />
      )}
      
      {currentView === "lightsOut" && (
        <LightsOutView 
          userId={DEMO_USER_ID} 
          onComplete={handleRecordingComplete} 
          onCancel={handleLightsOutCancel} 
        />
      )}
      
      {currentView === "inbox" && (
        <MorningInboxView 
          userId={DEMO_USER_ID} 
          onCreateCollage={handleCreateCollage} 
        />
      )}
    </>
  );
}
