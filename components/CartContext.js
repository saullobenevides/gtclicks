"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useUser } from "@stackframe/stack";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window !== 'undefined') { // Ensure localStorage is available
      const stored = localStorage.getItem('gtclicks_cart');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse cart from localStorage', e);
        }
      }
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gtclicks_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item) => {
    const existingIndex = items.findIndex(
      (i) => i.fotoId === item.fotoId
    );

    if (existingIndex >= 0) {
      return;
    }

    setItems((prev) => [...prev, item]);
  };

  const removeFromCart = (fotoId) => {
    setItems((prev) =>
      prev.filter((i) => i.fotoId !== fotoId)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + Number(item.preco), 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalPrice,
        itemCount: items.length,
      }}
    >
      {children}
      <CartSync items={items} setItems={setItems} />
    </CartContext.Provider>
  );
}

function CartSync({ items, setItems }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return <CartSyncInner items={items} setItems={setItems} />;
}

function CartSyncInner({ items, setItems }) {
    const user = useUser({ or: 'ignore' });
    const syncedRef = useRef(false);

    // Sync with server on login
    useEffect(() => {
        if (user && !syncedRef.current) {
        syncedRef.current = true;
        
        const syncCart = async () => {
            try {
            const res = await fetch('/api/carrinho/sync', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items }),
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.items) {
                setItems(data.items);
                }
            }
            } catch (error) {
            console.error('Failed to sync cart:', error);
            }
        };

        syncCart();
        }
    }, [user]);

    return null;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

