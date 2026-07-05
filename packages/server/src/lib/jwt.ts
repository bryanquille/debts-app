import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback-dev-secret";

export function signToken(payload: { id: string; email: string; name: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { id: string; email: string; name: string };
}
