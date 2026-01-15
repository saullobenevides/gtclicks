"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function Modal({ children }) {
  const router = useRouter();

  const handleOpenChange = (open) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
      <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
      <DialogContent 
        className="max-w-5xl w-full h-[90vh] md:h-auto md:max-h-[95vh] overflow-y-auto p-0 border-zinc-800 bg-zinc-950 focus:outline-none"
        aria-describedby={undefined}
      >
        <VisuallyHidden>
            <DialogTitle>Detalhes da Foto</DialogTitle>
        </VisuallyHidden>
        {children}
      </DialogContent>
    </Dialog>
  );
}
