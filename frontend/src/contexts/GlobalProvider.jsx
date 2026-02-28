import { GlobalContext } from "./Contexts";
import { useState } from "react";
import Cookies from "js-cookie";

export const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Cookies.get('loggedIn') === 'true';
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return Cookies.get('isAdmin') === 'true';
  });

  const [isLight, setIsLight] = useState(() => {
    const savedTheme = localStorage.getItem('user-theme');

    if (savedTheme) {
      document.documentElement.style.colorScheme = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
      return savedTheme === 'light';
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';

    document.documentElement.style.colorScheme = initialTheme;
    document.documentElement.setAttribute('data-theme', initialTheme);
    return !prefersDark;
  });

  const toggleTheme = () => {
    const newIsLight = !isLight;
    const newTheme = newIsLight ? 'light' : 'dark';

    setIsLight(newIsLight);
    document.documentElement.style.colorScheme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('user-theme', newTheme);
  };
  const logoutHandler = () => {
    setIsAdmin(false);
    setIsLoggedIn(false);
    localStorage.clear();
    Cookies.remove('loggedIn');
    Cookies.remove('isAdmin');
  }

  return (
    <GlobalContext.Provider value={{ isLoggedIn, setIsLoggedIn, isAdmin, isLight, toggleTheme, setIsAdmin, logoutHandler }}>
      {children}
    </GlobalContext.Provider>
  )
}