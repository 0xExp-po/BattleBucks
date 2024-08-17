import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from 'react-router-dom';
import { TRPCProvider } from './trpc/index.tsx'
import { TelegramProvider } from "./utils/telegram.tsx";
import { LanguageProvider } from "./utils/localization.tsx";
import "./index.scss";

window.Telegram.WebApp.ready();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TRPCProvider>
    <TelegramProvider>
      <LanguageProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LanguageProvider>
    </TelegramProvider>
  </TRPCProvider>
)
