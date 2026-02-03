import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, ChevronDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { PageSection } from "@/components/shared/layout";

export default function BuyerRanking({
  buyers = [],
  month = "",
  lastMonthWinner = null,
  lastMonthName = "",
}) {
  const hasContent =
    (lastMonthWinner && lastMonthWinner.name) || (buyers && buyers.length > 0);
  if (!hasContent) return null;

  return (
    <PageSection
      variant="default"
      containerWide
      className="bg-surface-section border-y border-border-subtle"
    >
      <div className="max-w-2xl mx-auto">
        {/* Banner RANKING */}
        <div className="rounded-2xl bg-action-primary shadow-lg px-6 py-4 mb-6">
          <h2 className="text-text-on-brand font-black text-xl uppercase tracking-tight text-center">
            Ranking
          </h2>
        </div>

        {/* Card branco com as seções */}
        <div className="rounded-2xl bg-surface-card border border-border-default shadow-md overflow-hidden">
          {/* ÚLTIMO VENCEDOR */}
          {lastMonthWinner && lastMonthWinner.name && (
            <>
              <div className="px-6 py-5">
                <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider mb-4">
                  Último vencedor
                  {lastMonthName && (
                    <span className="font-normal text-text-secondary normal-case ml-1">
                      ({lastMonthName})
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-surface-subtle">
                      <AvatarImage
                        src={lastMonthWinner.avatar}
                        alt={lastMonthWinner.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-surface-subtle font-bold text-text-primary">
                        {lastMonthWinner.name?.substring(0, 2).toUpperCase() ||
                          "US"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -left-1 bg-yellow-500 rounded-full p-1">
                      <Crown className="h-4 w-4 text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-text-primary">
                      {lastMonthWinner.name || "Usuário"}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {formatCurrency(lastMonthWinner.totalSpent || 0)} em{" "}
                      {lastMonthWinner.ordersCount}{" "}
                      {lastMonthWinner.ordersCount === 1 ? "compra" : "compras"}
                    </p>
                  </div>
                </div>
              </div>
              {buyers.length > 0 && (
                <div className="border-t border-border-subtle" />
              )}
            </>
          )}

          {/* RANKING DO MÊS */}
          {buyers.length > 0 && (
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">
                  Ranking do mês
                  {month && (
                    <span className="font-normal text-text-secondary normal-case ml-1">
                      ({month})
                    </span>
                  )}
                </h3>
                <span className="text-text-muted">
                  <ChevronDown className="h-4 w-4" />
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                O 1º lugar ganha <strong>1 foto grátis</strong> e{" "}
                <strong>desconto nas próximas compras</strong>!
              </p>
              <ul className="space-y-4">
                {buyers.map((buyer) => (
                  <li
                    key={buyer.id}
                    className={cn(
                      "flex items-center gap-4",
                      buyer.rank === 1 &&
                        "bg-action-primary/5 -mx-2 px-4 py-2 rounded-xl"
                    )}
                  >
                    <span className="text-lg font-bold text-text-secondary w-6">
                      {buyer.rank}.
                    </span>
                    <Avatar className="h-10 w-10 border border-border-subtle">
                      <AvatarImage
                        src={buyer.avatar}
                        alt={buyer.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-surface-subtle text-sm font-bold text-text-primary">
                        {buyer.name?.substring(0, 2).toUpperCase() || "US"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-primary truncate">
                        {buyer.name || "Usuário Anônimo"}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {formatCurrency(buyer.totalSpent || 0)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </PageSection>
  );
}
