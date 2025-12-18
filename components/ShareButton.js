"use client";

import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function ShareButton({ 
  title, 
  text, 
  url = typeof window !== 'undefined' ? window.location.href : '', 
  className,
  variant = "outline",
  size = "icon",
  children
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast.success("Conteúdo compartilhado!");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className} 
      onClick={handleShare}
      title="Compartilhar"
    >
      {children ? children : (
        copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />
      )}
    </Button>
  );
}
