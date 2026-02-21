import { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

// eslint-disable-next-line react-refresh/only-export-components
export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(/*() => {
    const loggedIn = Cookies.get('loggedIn')
    return loggedIn === 'true'
  }*/ false);

  const [isCookieLoaded, setIsCookieLoaded] = useState(false);


  useEffect(() => {
    const loggedIn = Cookies.get('loggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
    setIsCookieLoaded(true);

  }, []);

  const [cart, setCart] = useState(() => {
    const temp = localStorage.getItem('cart');
    if (temp) return temp;
    else return [];
  })

  return (
    <GlobalContext.Provider value={{ isLoggedIn, setIsLoggedIn, cart, setCart, isCookieLoaded}}>
      {children}
    </GlobalContext.Provider>
  )
}