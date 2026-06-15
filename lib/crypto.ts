import crypto from "crypto";

const SECRET = process.env.CHALLENGE_TOKEN_SECRET || process.env.CLERK_SECRET_KEY || "some-default-highly-secure-fallback-secret-123456";

export interface ChallengeTokenData {
  conceptId: string | null;
  questionPrompt: string;
  correctAnswer: string;
  explanation: string;
  expiresAt: number;
}

export function signChallengeToken(data: ChallengeTokenData): string {
  const payloadStr = JSON.stringify(data);
  const payloadBase64 = Buffer.from(payloadStr, "utf-8").toString("base64url");
  const hmac = crypto
    .createHmac("sha256", SECRET)
    .update(payloadBase64)
    .digest("hex");
  return `${payloadBase64}.${hmac}`;
}

export function verifyChallengeToken(token: string): ChallengeTokenData | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadBase64, hmac] = parts;
    const expectedHmac = crypto
      .createHmac("sha256", SECRET)
      .update(payloadBase64)
      .digest("hex");
    
    if (hmac !== expectedHmac) {
      return null;
    }
    
    const payloadStr = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    const data = JSON.parse(payloadStr) as ChallengeTokenData;
    
    // Check expiration: default is 30 minutes for a challenge session
    if (Date.now() > data.expiresAt) {
      return null;
    }
    
    return data;
  } catch (e) {
    return null;
  }
}
