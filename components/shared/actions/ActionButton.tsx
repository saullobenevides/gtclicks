"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ActionButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick" | "children"> {
  onAction?: () => void | Promise<void>;
  requireConfirm?: boolean;
  confirmMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function ActionButton({
  onAction,
  requireConfirm = false,
  confirmMessage = "Tem certeza?",
  successMessage,
  errorMessage = "Ocorreu um erro",
  children,
  disabled = false,
  ...buttonProps
}: ActionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (requireConfirm && !window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      await onAction?.();

      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      console.error("ActionButton error:", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
