"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useUser } from "@stackframe/stack";

const CartContext = createContext();

export function CartProvider({ children }) {
  const user = useUser({ or: 'ignore' });
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gtclicks_cart');
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse cart from localStorage', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gtclicks_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (item) => {
    const existingIndex = items.findIndex(
      (i) => i.fotoId === item.fotoId
    );

    if (existingIndex >= 0) {
      return;
    }

    setItems((prev) => [...prev, item]);
    setIsCartOpen(true); // Auto open cart
    
    // Optimistic sync - we still rely on the bulk sync for adding for now, 
    // or we could add specific endpoint. 
    // The bulk sync (CartSync) runs on mount, but NOT on changes.
    // So if we just added, we should probably tell the server?
    // The current CartSync ONLY runs on mount/login.
    // So 'addToCart' was NOT syncing to server until next refresh?!
    // That's also a bug. If I add to cart, close tab, on mobile different device... it won't be there.
    // I should sync additions too.
    if (user) {
        fetch('/api/carrinho/sync', {
            method: 'POST',
            body: JSON.stringify({ items: [item] }), // Send just the new item to merge
            headers: { 'Content-Type': 'application/json' }
        }).catch(console.error);
    }
  };

  const removeFromCart = (fotoId) => {
    setItems((prev) =>
      prev.filter((i) => i.fotoId !== fotoId)
    );

    if (user) {
        fetch('/api/carrinho/item', {
            method: 'DELETE',
            body: JSON.stringify({ fotoId }),
            headers: { 'Content-Type': 'application/json' }
        }).catch(console.error);
    }
  };

  const clearCart = () => {
    setItems([]);
    if (user) {
        fetch('/api/carrinho', {
            method: 'DELETE',
        }).catch(console.error);
    }
  };

  const getItemsByCollection = () => {
    const groups = {};
    items.forEach(item => {
      const colId = item.colecaoId || 'unknown';
      if (!groups[colId]) groups[colId] = [];
      groups[colId].push(item);
    });
    return groups;
  };

  const getItemPrice = (item) => {
    if (!item.colecaoId || !item.descontos || item.descontos.length === 0) {
      return Number(item.precoBase || item.preco || 0);
    }

    const collectionItems = items.filter(i => i.colecaoId === item.colecaoId);
    const count = collectionItems.length;

    // Find applicable discounts and pick the one with the highest 'min' that is <= count
    const applicableDiscounts = item.descontos
      .filter(d => count >= d.min)
      .sort((a, b) => b.min - a.min);

    if (applicableDiscounts.length > 0) {
      return Number(applicableDiscounts[0].price);
    }

    return Number(item.precoBase || item.preco || 0);
  };

  const getTotalPrice = () => {
    const groups = getItemsByCollection();
    let total = 0;

    Object.values(groups).forEach(groupItems => {
      if (groupItems.length === 0) return;
      
      const firstItem = groupItems[0];
      const unitPrice = getItemPrice(firstItem);
      total += unitPrice * groupItems.length;
    });

    return total;
  };

  const getSavings = () => {
    const originalTotal = items.reduce((sum, item) => sum + Number(item.precoBase || item.preco || 0), 0);
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

