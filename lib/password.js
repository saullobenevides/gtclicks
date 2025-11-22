import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(plain) {
  if (!plain) {
    throw new Error("Senha vazia não pode ser hasheada.");
  }

  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  if (!plain || !hash) {
    return false;
  }

  return bcrypt.compare(plain, hash);
}
