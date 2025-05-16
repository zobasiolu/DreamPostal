import React from "react";
import MorningInboxView from "@/components/MorningInboxView";
import { useToast } from "@/hooks/use-toast";

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = 1;

export default function Inbox() {
  const { toast } = useToast();
  
  // Handle collage creation
  const handleCreateCollage = () => {
    toast({
      title: "Collage Creation",
      description: "This feature is coming soon!",
    });
  };
  
  return (
    <MorningInboxView 
      userId={DEMO_USER_ID} 
      onCreateCollage={handleCreateCollage} 
    />
  );
}
