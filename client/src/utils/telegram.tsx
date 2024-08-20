import { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "../trpc/trpc";

interface TelegramData {
  initDataUnsafe: Telegram.InitDataUnsafe;
  initData?: Telegram.AuthenticatedData;
  checked: boolean;
  valid: boolean;
};

// intended to be used only once
function useTelegramData() {
  const [checked, setChecked] = useState(false);
  const [valid, setValid] = useState(false);
  const [initData, setInitData] = useState<Telegram.AuthenticatedData>();
  const authUserMutation = trpc.user.authenticateUser.useMutation();

  const WebApp = window.Telegram.WebApp;
  const initDataUnsafe: Telegram.InitDataUnsafe = WebApp.initDataUnsafe;

  useEffect(() => {
    if (!WebApp.initData) {
      console.log("Not in Telegram webview");
      return;
    }
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
    setChecked(true);
  }, []);

  return { initDataUnsafe, initData, checked, valid } as TelegramData;
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

function useTelegramColors(colors: { header: string }) {
  const WebApp = window.Telegram.WebApp;
  const [initialHeader] = useState(WebApp.headerColor);

  useEffect(() => {
    if (!WebApp) return;
    WebApp.setHeaderColor(colors.header);
    return () => WebApp.setHeaderColor(initialHeader);
  }, []);
}

export { useTelegram, useTelegramColors };
