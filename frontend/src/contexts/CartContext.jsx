import { createContext, useEffect, useState } from "react";


// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState(() => {
    const temp = localStorage.getItem('cart');
    return temp ? JSON.parse(temp) : [];
  })

  const addItemToCart = (newItem) => {
    setCart((prev) => {
      const index = prev.findIndex(item => item.ProdId === newItem.ProdId);

      if (index !== -1) {
        return prev.map((item, idx) =>
          idx === index
            ? { ...item, count: item.count + 1 }
            : item
        )
      };

      return [...prev, { ...newItem, count: 1 }];
    });
  }

  const removeItemFromCart = (targetItem) => {
    setCart((prev) => {
      const existingItem = prev.find(item => item.ProdId === targetItem.ProdId);

      if (!existingItem) return prev;

      if (existingItem.count === 1) {
        return prev.filter(item => item.ProdId !== targetItem.ProdId);
      }

      return prev.map((item) =>
        item.ProdId === targetItem.ProdId
          ? { ...item, count: item.count - 1 }
          : item
      );
    });
  };
  const emptyCart = () => {
    setCart([]);
  }


  const getCartContent = () => {
    if (cart.length === 0) return 0;
    let sum = 0;
    cart.forEach(item => {
      sum += item.count;
    });
    return sum;
  }

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const updateItemCount = (prodId, newCount) => {
    const count = parseInt(newCount);

    if (isNaN(count) || count < 0) return;

    setCart((prev) =>
      prev.map((item) =>
        item.ProdId === prodId
          ? { ...item, count: count }
          : item
      )
    );
  };

  const handleBlur = (prodId, value) => {
    if (value === "" || parseInt(value) === 0) {
      setCart(prev => prev.filter(item => item.ProdId !== prodId));
    }
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addItemToCart, getCartContent, removeItemFromCart, emptyCart, updateItemCount, handleBlur }}>
      {children}
    </CartContext.Provider>
  )
}