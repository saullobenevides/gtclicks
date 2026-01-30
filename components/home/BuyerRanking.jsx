import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageSection, SectionHeader } from "@/components/shared/layout";

export default function BuyerRanking({ buyers = [] }) {
  if (!buyers || buyers.length === 0) return null;

  // Reorder for Podium: 2nd, 1st, 3rd (if we have at least 3)
  const podiumOrder = [];
  if (buyers.length >= 2) podiumOrder.push(buyers[1]);
  if (buyers.length >= 1) podiumOrder.push(buyers[0]);
  if (buyers.length >= 3) podiumOrder.push(buyers[2]);

  // If less than 3, just show them in order
  const displayBuyers = buyers.length < 3 ? buyers : podiumOrder;

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-slate-400 fill-slate-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700 fill-amber-700" />;
      default:
        return <Trophy className="h-5 w-5 text-text-muted" />;
    }
  };

  const getPodiumHeight = (rank) => {
    if (buyers.length < 3) return "h-auto";
    switch (rank) {
      case 1:
        return "md:h-64 h-auto scale-105 z-10";
      case 2:
        return "md:h-52 h-auto";
      case 3:
        return "md:h-48 h-auto";
      default:
        return "h-auto";
    }
  };

  return (
    <PageSection
      variant="default"
      containerWide
      className="bg-surface-section border-y border-border-subtle"
    >
      <SectionHeader
        title={
          <span className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-action-primary" /> TOP COMPRADORES
          </span>
        }
        description="Os maiores apoiadores da comunidade"
      />

      <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-end max-w-4xl mx-auto">
        {displayBuyers.map((buyer) => (
          <Card
            key={buyer.id}
            className={cn(
              "w-full max-w-sm md:w-1/3 relative border-border-default overflow-visible transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
              getPodiumHeight(buyer.rank),
              buyer.rank === 1
                ? "border-action-primary/50 bg-surface-elevated shadow-md"
                : "bg-surface-card",
            )}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-surface-page p-2 rounded-full border border-border-subtle shadow-sm z-20">
              {getRankIcon(buyer.rank)}
            </div>

            <CardContent className="flex flex-col items-center justify-center p-6 h-full text-center pt-8">
              <Avatar
                className={cn(
                  "border-2 mb-4",
                  buyer.rank === 1
                    ? "h-24 w-24 border-yellow-500 ring-4 ring-yellow-500/20"
                    : "h-16 w-16 border-surface-subtle",
                )}
              >
                <AvatarImage
                  src={buyer.avatar}
                  alt={buyer.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-surface-subtle font-bold text-text-primary">
                  {buyer.name?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <h3 className="font-bold text-lg leading-tight line-clamp-1">
                  {buyer.name || "Usuário Anônimo"}
                </h3>
                <div className="text-sm text-text-secondary font-medium">
                  {buyer.ordersCount}{" "}
                  {buyer.ordersCount === 1 ? "compra" : "compras"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageSection>
  );
}
