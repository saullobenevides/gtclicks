"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * ActionButton - Botão com loading state e confirmação automática
 * 
 * @param {Object} props
 * @param {Function} props.onAction - Ação a ser executada (pode ser async)
 * @param {boolean} props.requireConfirm - Se requer confirmação antes de executar
 * @param {string} props.confirmMessage - Mensagem de confirmação
 * @param {string} props.successMessage - Mensagem de sucesso
 * @param {string} props.errorMessage - Mensagem de erro
 * @param {React.ReactNode} props.children - Conteúdo do botão
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {string} props.variant - Variante do botão (shadcn/ui)
 * @param {string} props.size - Tamanho do botão
 * @param {string} props.className - Classes CSS adicionais
 */
export default function ActionButton({
  onAction,
  requireConfirm = false,
  confirmMessage = "Tem certeza?",
  successMessage,
  errorMessage = "Ocorreu um erro",
  children,
  disabled = false,
  ...buttonProps
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    // Confirm if required
    if (requireConfirm && !window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      await onAction();
      
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      console.error('ActionButton error:', error);
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
