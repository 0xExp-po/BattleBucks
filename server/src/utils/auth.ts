import CryptoJS from "crypto-js";

export function verifyTelegramLogin(
  initData: string,
  botToken: string
): boolean {
  try {
    const parsedData = new URLSearchParams(initData);
    const hash = parsedData.get("hash");

    if (!hash) {
      console.error("No hash found in initData");
      return false;
    }

    const authData = [...parsedData.entries()]
      .filter(([key]) => key !== "hash")
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((e) => `${e[0]}=${e[1]}`)
      .join("\n");

    const secretKey = CryptoJS.SHA256(botToken);
    const checkHash = CryptoJS.HmacSHA256(authData, secretKey).toString(
      CryptoJS.enc.Hex
    );

    console.log("Auth data:", authData);
    console.log("Check hash:", checkHash);

    return checkHash === hash;
  } catch (error) {
    console.error("Error verifying Telegram login:", error);
    return false;
  }
}
