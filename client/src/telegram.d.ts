// src/telegram.d.ts

declare namespace Telegram {
  interface User {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  }

  interface WebApp {
    [x: string]: any;
    initData: string;
    initDataUnsafe: {
      user?: User;
      query_id?: string;
      auth_date?: number;
      hash?: string;
    };
    expand(): void;
    ready(): void;
  }
}

interface Window {
  Telegram: {
    WebApp: Telegram.WebApp;
  };
}