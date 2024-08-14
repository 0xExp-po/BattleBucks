// src/telegram.d.ts

declare namespace Telegram {
  interface WebApp {
    [x: string]: any;
    initData: string;
    initDataUnsafe: InitDataUnsafe;
    expand(): void;
    ready(): void;
  }

  interface User {
    id: number;
    first_name: string;
    last_name?: string;
    username: string;
    language_code?: string;
  }

  interface InitDataUnsafe {
    user?: User;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  }

  interface AuthenticatedData {
    user: {
      name: string;
      username: string;
      phoneNo?: string | null | undefined;
      profilePicture?: string | null | undefined;
      bio?: string | null | undefined;
    };
    isNewUser: boolean;
    token: string;
  }
}

interface Window {
  Telegram: {
    WebApp: Telegram.WebApp;
  };
}