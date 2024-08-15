import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

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

    const dataCheckString = [...parsedData.entries()]
      .filter(([key]) => key !== "hash")
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((e) => `${e[0]}=${e[1]}`)
      .join("\n");

    const secretKey = CryptoJS.HmacSHA256(botToken, "WebAppData");
    const checkHash = CryptoJS.HmacSHA256(dataCheckString, secretKey).toString(
      CryptoJS.enc.Hex
    );

    // Optionally, check the auth_date to prevent use of outdated data
    const authDate = parsedData.get("auth_date");
    if (authDate) {
      const currentTime = Math.floor(Date.now() / 1000);
      const authTime = parseInt(authDate, 10);
      if (currentTime - authTime > 86400) { // 24 hours
        console.error("Auth date is too old");
        return false;
      }
    }

    return checkHash === hash;
  } catch (error) {
    console.error("Error verifying Telegram login:", error);
    return false;
  }
}

export function generateToken(userId: string): string {
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    throw new Error("JWT_SECRET_KEY is not defined in environment variables");
  }

  const token = jwt.sign(
    { userId },
    secretKey,
    { expiresIn: "7d" } // Token expires in 7 days
  );

  return token;
}
