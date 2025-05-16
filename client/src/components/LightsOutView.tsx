import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, X } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useMutation } from "@tanstack/react-query";
import { recordAudio } from "@/lib/openai";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LightsOutViewProps {
  userId: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function LightsOutView({ userId, onComplete, onCancel }: LightsOutViewProps) {
  const [countdown, setCountdown] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  
  // Initialize audio recorder with 5 second duration
  const { 
    status, 
    audioBase64, 
    startRecording, 
    stopRecording, 
    resetRecording,
    error
  } = useAudioRecorder({ duration: 5000 });
  
  // Mutation for submitting audio recording
  const recordMutation = useMutation({
    mutationFn: (audioData: string) => recordAudio(userId, audioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postcards', userId] });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Recording failed",
        description: "Something went wrong while creating your dreamcard.",
        variant: "destructive"
      });
      resetRecording();
      setIsRecording(false);
      setCountdown(5);
    }
  });
  
  // Handle error in recording
  useEffect(() => {
    if (error) {
      toast({
        title: "Microphone access failed",
        description: "Please allow microphone access to record sleep sounds.",
        variant: "destructive"
      });
      resetRecording();
      setIsRecording(false);
      setCountdown(5);
    }
  }, [error, toast, resetRecording]);
  
  // Submit audio when recording completes
  useEffect(() => {
    if (status === "stopped" && audioBase64) {
      recordMutation.mutate(audioBase64);
    }
  }, [status, audioBase64, recordMutation]);
  
  // Handle countdown timer
  useEffect(() => {
    let timer: number | null = null;
    
    if (isRecording && countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRecording, countdown]);
  
  // Handle start recording
  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      await startRecording();
    } catch (err) {
      console.error("Error starting recording:", err);
      setIsRecording(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    resetRecording();
    onCancel();
  };
  
  return (
    <div className="app-height gradient-bg-dark">
      <div className="flex flex-col items-center justify-center h-full text-white p-5">
        <div className="text-center mb-12 relative">
          <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <h2 className="text-3xl font-serif mb-4 relative">Time to Drift Away</h2>
          <p className="text-lg opacity-80 mb-8 max-w-xs mx-auto">
            We'll capture the ambient sounds around you for 5 seconds to create your dreamscape.
          </p>
          
          {/* Timer Circle */}
          <div className="w-56 h-56 rounded-full border-4 border-white/30 flex items-center justify-center mx-auto relative">
            <div className={`absolute inset-2 rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent ${isRecording ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}></div>
            <div className="text-5xl font-light">{countdown}</div>
          </div>
        </div>
        
        <div className="space-y-6 w-full max-w-xs text-center">
          <p className="opacity-70 text-sm">Please ensure your surroundings are quiet for the best experience</p>
          
          {/* Mic Permission Request */}
          <Button
            onClick={handleStartRecording}
            disabled={isRecording || recordMutation.isPending}
            className="w-full py-4 px-6 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition flex items-center justify-center gap-2 h-auto"
          >
            <Mic className="h-5 w-5" />
            {isRecording ? "Recording..." : "Allow Microphone Access"}
          </Button>
          
          {/* Cancel Button */}
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-white/70 hover:text-white transition"
          >
            Cancel and return
          </Button>
        </div>
      </div>
    </div>
  );
}
