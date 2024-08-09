import { useEffect, useState } from "react";
import { trpc } from "../trpc/trpc";

export default function useTelegramData() {
  const [checked, setChecked] = useState(false);
  const [valid, setValid] = useState(false);
  const [initData, setInitData] = useState<Telegram.AuthenticatedData>();
  const authUser = trpc.user.authenticateUser.useMutation();

  const WebApp = window.Telegram.WebApp;
  const initDataUnsafe: Telegram.InitDataUnsafe = WebApp.initDataUnsafe;

  useEffect(() => {
    if (!WebApp.initData) {
      console.log("Not in Telegram webview");
      return;
    }
    console.log(WebApp.initDataUnsafe)
    console.log("Verifying initData:", WebApp.initData)
    authUser.mutateAsync({ initData: WebApp.initData }).then(r => {
      setValid(r.status === 200);
      console.log(r.result);
      setInitData(r.result || undefined);
    });
    setChecked(true);
  }, []);

  return { initDataUnsafe, initData, checked, valid };
}