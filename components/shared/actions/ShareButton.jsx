"use client";

import {
  Share2,
  Link as LinkIcon,
  Check,
  QrCode,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ShareButton({
  title,
  text,
  url = typeof window !== "undefined" ? window.location.href : "",
  className,
  variant = "outline",
  size = "icon",
  children,
}) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(url || window.location.href);
    }
  }, [url]);

  const finalUrl = currentUrl || url || "";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: finalUrl,
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
    navigator.clipboard.writeText(finalUrl).then(() => {
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareToWhatsApp = () => {
    const encodedText = encodeURIComponent(`${text}\n\n${finalUrl}`);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            title="Ver QR Code"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-md bg-surface-elevated border-border-default text-text-primary z-150 shadow-shadow-lg backdrop-blur-xl"
          overlayClassName="z-[149]"
        >
          <DialogHeader>
            <DialogTitle>Compartilhar Coleção</DialogTitle>
            <DialogDescription className="text-text-muted">
              Escaneie o QR Code ou escolha uma opção abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 gap-6">
            <div className="bg-white p-4 rounded-radius-lg">
              <QRCodeSVG value={finalUrl} size={200} />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <Button
                onClick={shareToWhatsApp}
                variant="secondary"
                className="gap-2 h-11"
              >
                <MessageCircle className="h-4 w-4 text-green-500" />
                WhatsApp
              </Button>
              <Button
                onClick={copyToClipboard}
                variant="secondary"
                className="gap-2 h-11"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                {copied ? "Copiado" : "Copiar Link"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleShare}
        title="Compartilhar"
      >
        {children ? (
          children
        ) : copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
