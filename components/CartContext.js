"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("gtclicks_cart");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
    setLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("gtclicks_cart", JSON.stringify(items));
    }
  }, [items, loaded]);

  const addToCart = (item) => {
    // item = { fotoId, licencaId, titulo, preco, licenca, previewUrl }
    const existingIndex = items.findIndex(
      (i) => i.fotoId === item.fotoId && i.licencaId === item.licencaId
    );

    if (existingIndex >= 0) {
      // Already in cart, do nothing or update quantity if needed
      return;
    }

    setItems((prev) => [...prev, item]);
  };

  const removeFromCart = (fotoId, licencaId) => {
    setItems((prev) =>
      prev.filter((i) => !(i.fotoId === fotoId && i.licencaId === licencaId))
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
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
