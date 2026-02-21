import { createContext, useState } from "react";
import Cookies from "js-cookie";

// eslint-disable-next-line react-refresh/only-export-components
export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const loggedIn = Cookies.get('loggedIn');
    console.log(Cookies.get())
    return loggedIn === 'true'
  });

  const [cart, setCart] = useState(() => {
    const temp = localStorage.getItem('cart');
    if (temp) return temp;
    else return [];
  })

  return (
    <GlobalContext.Provider value={{ isLoggedIn, setIsLoggedIn, cart, setCart }}>
      {children}
    </GlobalContext.Provider>
  )
}