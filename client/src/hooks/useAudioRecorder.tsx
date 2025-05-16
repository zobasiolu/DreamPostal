import { useState, useCallback, useRef } from "react";

type AudioRecorderStatus = "inactive" | "recording" | "paused" | "stopped";

interface AudioRecorderState {
  status: AudioRecorderStatus;
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioBase64: string | null;
  error: Error | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  resetRecording: () => void;
}

export function useAudioRecorder(options = { duration: 5000 }): AudioRecorderState {
  const [status, setStatus] = useState<AudioRecorderStatus>("inactive");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<number | null>(null);
  
  const resetRecording = useCallback(() => {
    setStatus("inactive");
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioBase64(null);
    setError(null);
    audioChunksRef.current = [];
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);
  
  const startRecording = useCallback(async () => {
    resetRecording();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      
      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Remove the data URL prefix (data:audio/wav;base64,)
          const base64Content = base64data.split(',')[1];
          setAudioBase64(base64Content);
        };
        
        setStatus("stopped");
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      });
      
      mediaRecorderRef.current.start();
      setStatus("recording");
      
      // Automatically stop after specified duration
      timeoutRef.current = window.setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          stopRecording();
        }
      }, options.duration);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [options.duration, resetRecording]);
  
  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, []);
  
  return {
    status,
    audioBlob,
    audioUrl,
    audioBase64,
    error,
    startRecording,
    stopRecording,
    resetRecording
  };
}
