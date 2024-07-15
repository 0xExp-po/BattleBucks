export default function useTelegramUser() {
  const WebApp = window.Telegram.WebApp;
  const user: Telegram.User | undefined = WebApp.initDataUnsafe.user;
  return user;
}