import crypto from "crypto";

export function encrypt(
  secret: string,
  key: string,
  iv = crypto.randomBytes(16),
  algorithm = "aes256",
) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, "hex"), iv);
  const ciphertext =
    cipher.update(secret, "utf8", "binary") + cipher.final("binary");

  return { ciphertext, iv };
}

export function decrypt(
  ciphertext: Buffer | string,
  key: string,
  iv: Buffer,
  algorithm = "aes256",
) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key, "hex"),
    iv,
  );
  let plaintext =
    typeof ciphertext === "string"
      ? decipher.update(ciphertext, "binary", "utf8")
      : decipher.update(ciphertext, undefined, "utf8");
  plaintext += decipher.final("utf8");
  return plaintext;
}
