import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CartContext } from "./Contexts";
import { toast } from "react-toastify";



export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState(() => {
    const temp = localStorage.getItem('cart');
    return temp ? JSON.parse(temp) : [];
  })

  const cartRef = useRef(cart);
  useEffect(() => { cartRef.current = cart; }, [cart]);

  const addItemToCart = useCallback((newItem) => {
    const prev = cartRef.current;
    const index = prev.findIndex(item => item.ProdID === newItem.ProdID);

    if (index !== -1) {
      if (prev[index].count >= prev[index].stock) {
        toast.error('A termékből nem lehet többet rendelni.');
        return;
      }
      toast.success('Sikeresen kosárba helyezve.');
      setCart(prev.map((item, idx) =>
        idx === index ? { ...item, count: item.count + 1 } : item
      ));
      return;
    }

    toast.success('Sikeresen kosárba helyezve.');
    setCart([...prev, { ...newItem, count: 1 }]);
  }, []);



  const removeItemFromCart = useCallback((targetItem) => {
    setCart((prev) => {
      const existingItem = prev.find(item => item.ProdID === targetItem.ProdID);

      if (!existingItem) return prev;

      if (existingItem.count === 1) {
        return prev.filter(item => item.ProdID !== targetItem.ProdID);
      }

      return prev.map((item) =>
        item.ProdID === targetItem.ProdID
          ? { ...item, count: item.count - 1 }
          : item
      );
    });
  }, []);

  const deleteItemFromCart = useCallback((ProdID) => {
    setCart((prev) => prev.filter(item => item.ProdID !== ProdID));
  }, []);

  const emptyCart = useCallback(() => {
    setCart([]);
  }, []);


  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.count, 0), [cart]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const updateItemCount = useCallback((item, newCount) => {
    const count = parseInt(newCount);

    if (isNaN(count) || count < 0) return;
    if (count > item.stock) return;

    setCart((prev) =>
      prev.map((c) =>
        c.ProdID === item.ProdID
          ? { ...c, count: count }
          : c
      ));
  }, []);

  const handleBlur = useCallback((ProdID, value) => {
    if (value === "" || parseInt(value) === 0) {
      setCart(prev => prev.filter(item => item.ProdID !== ProdID));
    }
  }, []);

  return (
    <CartContext.Provider value={{ cart, setCart, addItemToCart, cartCount, removeItemFromCart, deleteItemFromCart, emptyCart, updateItemCount, handleBlur }}>
      {children}
    </CartContext.Provider>
  )
}