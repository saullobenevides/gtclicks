import { cn } from "@/lib/utils";

export default function PageContainer({ children, className }) {
  return (
    <div className={cn("container-wide px-4", className)}>
      <div className="bg-card/95 backdrop-blur-lg border border-border/50 shadow-2xl rounded-2xl p-6 md:p-10 min-h-[500px]">
        {children}
      </div>
    </div>
  );
}
