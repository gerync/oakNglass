import { createRoot } from 'react-dom/client';
import './style/index.css';
import App from './pages/App';
import { GlobalContext, GlobalProvider } from './contexts/GlobalContext';
import { ConfigProvider, theme } from 'antd';
import { CartProvider } from './contexts/CartContext';
import { useContext } from 'react';

const { defaultAlgorithm, darkAlgorithm } = theme;


// eslint-disable-next-line react-refresh/only-export-components
function ThemedApp() {
  const { isLight } = useContext(GlobalContext);

  return (
    <ConfigProvider
      theme={{
        algorithm: isLight ? defaultAlgorithm : darkAlgorithm,
        token: {
          colorPrimary: '#800020',
          colorText: isLight ? 'black' : '#E0D5C1',
          colorBgContainer: isLight ? '#FBE6E9' : '#1A1614',
          colorBgElevated: isLight ? '#FBE6E9' : '#1A1614',
          colorBorder: '#800020',
          colorPrimaryHover: '#800020',
        },
        components: {
          Slider: {
            trackBg: '#800020',
            trackHoverBg: '#800020',
            handleColor: '#800020',
            handleActiveColor: '#800020',
            dotActiveBorderColor: '#800020',
            railHoverBg: isLight ? '#fcebec' : '#2A2624',
          }
        }
      }}
    >
      <CartProvider>
        <App />
      </CartProvider>
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <GlobalProvider>
    <ThemedApp />
  </GlobalProvider>
)
