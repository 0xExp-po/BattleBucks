import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from 'react-router-dom';
import { TRPCProvider } from './trpc/index.tsx'
import { SocketProvider } from './utils/socket.tsx';
import "./index.scss";

window.Telegram.WebApp.ready();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TRPCProvider>
    <SocketProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SocketProvider>
  </TRPCProvider>
)
