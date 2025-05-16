import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Set correct viewport height for mobile browsers
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Initial set and update on resize
setViewportHeight();
window.addEventListener('resize', setViewportHeight);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <App />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
