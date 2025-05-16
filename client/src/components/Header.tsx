import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, User, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  showHome?: boolean;
  showUser?: boolean;
}

export default function Header({ 
  title = "Subconscious<span>Postcards</span>", 
  showHome = false,
  showUser = true
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  
  return (
    <header className="flex justify-between items-center p-5">
      {location === "/" ? (
        <h1 className="text-2xl font-serif font-semibold" dangerouslySetInnerHTML={{ 
          __html: title.replace("<span>", "<span class='text-primary'>").replace("</span>", "</span>")
        }} />
      ) : (
        <h1 className="text-2xl font-serif font-semibold">{title}</h1>
      )}
      
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full hover:bg-accent"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        {showHome && (
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-accent"
            asChild
          >
            <Link href="/">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
        )}
        
        {showUser && (
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-accent"
          >
            <User className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
