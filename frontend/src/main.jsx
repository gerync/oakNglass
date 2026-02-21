import { createRoot } from 'react-dom/client';
import './style/index.css';
import App from './pages/App';
import { GlobalProvider } from './contexts/GlobalContext';
import { ConfigProvider } from 'antd';



createRoot(document.getElementById('root')).render(
  <GlobalProvider>
    <ConfigProvider theme={{
      components:{
        Slider:{
          trackBg: '#800020',
          handleColor: '#800020',
          handleActiveColor: '#800020',
          handleActiveOutlineColor: '#8a0f0f4d',
          trackHoverBg: '#800020',
          dotActiveBorderColor: '#800020',
          dotBorderColor: '#800020',
          railHoverBg: '#FBE6E9',
          colorPrimaryBorderHover: '#800020',
        }
      }
    }}>
      <App />
    </ConfigProvider>
  </GlobalProvider>
)
