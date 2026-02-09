"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { useUser } from "@stackframe/stack";
import { toast } from "sonner";

const CartContext = createContext();

export function CartProvider({ children }) {
  const user = useUser({ or: "ignore" });
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gtclicks_cart");
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("gtclicks_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = async (item) => {
    const existingIndex = items.findIndex((i) => i.fotoId === item.fotoId);

    if (existingIndex >= 0) {
      return;
    }

    setItems((prev) => [...prev, item]);
    setIsCartOpen(true); // Auto open cart

    if (user) {
      try {
        const { addToCart: addToCartAction } = await import("@/actions/cart");
        await addToCartAction({
          fotoId: item.fotoId,
          licencaId: item.licencaId,
        });
      } catch (error) {
        console.error("Failed to sync addition to server:", error);
        toast.warning(
          "Não foi possível sincronizar com sua conta. Os itens ficaram salvos localmente."
        );
      }
    }
  };

  const removeFromCart = async (fotoId) => {
    const itemToRemove = items.find((i) => i.fotoId === fotoId);

    setItems((prev) => prev.filter((i) => i.fotoId !== fotoId));

    if (user && itemToRemove) {
      try {
        // We need the database item ID, but context only has fotoId.
        // The server action 'removeFromCart' takes itemId.
        // Sync logic is a bit disconnected here.
        // For simplicity, we'll keep using the API for complex sync or improve the action.
        const { removeFromCart: removeFromCartAction } = await import(
          "@/actions/cart"
        );
        // In this project, database items are linked to users.
        // We might need a 'removeFromCartByFotoId' action.

        // Let's use the API for now if it's already working,
        // OR better: create more flexible actions.
        fetch("/api/carrinho/item", {
          method: "DELETE",
          body: JSON.stringify({ fotoId }),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => {
            if (!res.ok) {
              toast.warning(
                "Não foi possível sincronizar a remoção com sua conta."
              );
            }
          })
          .catch(() => {
            toast.warning(
              "Não foi possível sincronizar a remoção com sua conta."
            );
          });
      } catch (error) {
        console.error("Failed to sync removal to server:", error);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      try {
        const { clearCart: clearCartAction } = await import("@/actions/cart");
        await clearCartAction();
      } catch (error) {
        console.error("Failed to clear cart on server:", error);
        toast.warning("Não foi possível sincronizar o carrinho com sua conta.");
      }
    }
  };

  const getItemsByCollection = () => {
    const groups = {};
    items.forEach((item) => {
      const colId = item.colecaoId || "unknown";
      if (!groups[colId]) groups[colId] = [];
      groups[colId].push(item);
    });
    return groups;
  };

  const getItemPrice = (item) => {
    if (!item.colecaoId || !item.descontos || item.descontos.length === 0) {
      return Number(item.precoBase || item.preco || 0);
    }

    const collectionItems = items.filter((i) => i.colecaoId === item.colecaoId);
    const count = collectionItems.length;

    // Find applicable discounts and pick the one with the highest 'min' that is <= count
    const applicableDiscounts = item.descontos
      .filter((d) => count >= d.min)
      .sort((a, b) => b.min - a.min);

    if (applicableDiscounts.length > 0) {
      return Number(applicableDiscounts[0].price);
    }

    return Number(item.precoBase || item.preco || 0);
  };

  const getTotalPrice = () => {
    const groups = getItemsByCollection();
    let total = 0;

    Object.values(groups).forEach((groupItems) => {
      if (groupItems.length === 0) return;

      const firstItem = groupItems[0];
      const unitPrice = getItemPrice(firstItem);
      total += unitPrice * groupItems.length;
    });

    return total;
  };

  const getSavings = () => {
    const originalTotal = items.reduce(
      (sum, item) => sum + Number(item.precoBase || item.preco || 0),
      0
    );
    return originalTotal - getTotalPrice();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getItemPrice,
        getSavings,
        itemCount: items.length,
        isCartOpen,
        setIsCartOpen,
        isLoaded,
      }}
    >
      {children}
      <CartSync items={items} setItems={setItems} />
    </CartContext.Provider>
  );
}

function CartSync({ items, setItems }) {
  // Use useSyncExternalStore for proper client-side detection without warnings
  const isClient = useSyncExternalStore(
    () => () => {}, // subscribe (no-op)
    () => true, // getSnapshot (client)
    () => false // getServerSnapshot (server)
  );

  if (!isClient) return null;

  return <CartSyncInner items={items} setItems={setItems} />;
}

function CartSyncInner({ items, setItems }) {
  const user = useUser({ or: "ignore" });
  const syncedRef = useRef(false);

  // Sync with server on login
  useEffect(() => {
    if (user && !syncedRef.current) {
      syncedRef.current = true;

      const syncCart = async () => {
        try {
          const res = await fetch("/api/carrinho/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.items) {
              setItems(data.items);
            }
          } else {
            toast.warning(
              "Não foi possível sincronizar seu carrinho com a conta. Os itens locais foram mantidos."
            );
          }
        } catch (error) {
          console.error("Failed to sync cart:", error);
          toast.warning(
            "Não foi possível sincronizar seu carrinho com a conta. Os itens locais foram mantidos."
          );
        }
      };

      syncCart();
    }
  }, [user, items, setItems]);

  return null;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
