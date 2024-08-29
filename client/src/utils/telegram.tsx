import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { trpc } from "../trpc/trpc";

interface TelegramData {
  initDataUnsafe: Telegram.InitDataUnsafe;
  initData?: Telegram.AuthenticatedData;
  checked: boolean;
  valid: boolean;
  tokenData?: {
    exp: number,
    iat: number,
    userId: string,
  };
};

function parseJwt(token: string) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

function generateID() {
  let res = "";

  for (let i = 0; i < 20; i++) {
    res += Math.floor(Math.random() * 10);
  }

  return res;
}

function generateName() {
  const names = ["Ivan", "Pero", "Mate", "Sime", "Stipe", "Jure"];
  return names[Math.floor(Math.random() * names.length)];
}

function generateSurname() {
  const names = ["Peric", "Berislavic", "Radic", "Cvitanovic", "Rakic", "Sakic"];
  return names[Math.floor(Math.random() * names.length)];
}

// intended to be used only once
function useTelegramData() {
  const [checked, setChecked] = useState(false);
  const [valid, setValid] = useState(false);
  const [initData, setInitData] = useState<Telegram.AuthenticatedData>();
  const authUserMutation = trpc.user.authenticateUser.useMutation();

  const WebApp = window.Telegram.WebApp;
  const initDataUnsafe: Telegram.InitDataUnsafe = WebApp.initDataUnsafe;

  const tokenData: any = useMemo(() => {
    if (!initData) return;
    return parseJwt(initData.token);
  }, [initData?.token]);

  console.log("Yippe", initData, tokenData)

  // for production use
  const handleInVebView = () => {
    console.info("InitDataUnsafe", WebApp.initDataUnsafe);
    console.info("Verifying initData:", WebApp.initData);
    authUserMutation.mutateAsync({ initData: WebApp.initData }).then(r => {
      console.info(r);
      setValid(r.status === 200);
      console.info("initdata result: ", r.result);
      if (r.result === null) {
        console.info("telegram user could not be verified");
      }
      setInitData(r.result || undefined);
    });
  }

  // for testing purposes
  const handleNotInWebView = () => {
    console.log("Not in Telegram webview, sending dummy data");

    const fakeData = {
      id: generateID(),
      first_name: generateName(),
      last_name: generateSurname(),
    };

    authUserMutation.mutateAsync({ initData: new URLSearchParams(fakeData).toString() }).then(r => {
      console.info(r);
      setValid(r.status === 200);
      console.info("fake initdata result: ", r.result);
      if (r.result === null) {
        console.info("telegram user could not be verified");
      }
      setInitData(r.result || undefined);
    });
  }

  useEffect(() => {
    WebApp.initData ? handleInVebView() : handleNotInWebView();
    setChecked(true);
  }, []);

  return { initDataUnsafe, initData, tokenData, checked, valid } as TelegramData;
}

const TelegramContext = createContext<TelegramData>({} as TelegramData);

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const data = useTelegramData();

  return (
    <TelegramContext.Provider value={data}>
      {children}
    </TelegramContext.Provider>
  )
}

function useTelegram() {
  return useContext(TelegramContext);
}

let def: string;

function useTelegramColors(colors: { header: string }) {
  const WebApp = window.Telegram.WebApp;
  const [initialHeader] = useState(WebApp.headerColor);
  if (!def) def = WebApp.headerColor;

  useEffect(() => {
    if (!WebApp) return;
    WebApp.setHeaderColor(colors.header);
    return () => WebApp.setHeaderColor(def || initialHeader);
  }, []);
}

export { useTelegram, useTelegramColors };
