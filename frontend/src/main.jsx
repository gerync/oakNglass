import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style/index.css';
import App from './pages/App';
import { GlobalProvider } from './contexts/GlobalContext';

createRoot(document.getElementById('root')).render(
  <GlobalProvider>
    <App />
  </GlobalProvider>
)
