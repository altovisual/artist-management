// lib/crypto.ts

// This function takes the raw string key from the environment variable
// and imports it as a CryptoKey object that the Web Crypto API can use.
async function getCryptoKey(): Promise<CryptoKey> {
  const keyString = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!keyString) {
    throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY is not set in the environment variables.');
  }

  // Create a 32-byte buffer (for a 256-bit key)
  const keyBuffer = new Uint8Array(32);
  const encodedKey = new TextEncoder().encode(keyString);

  // Copy bytes from the user-provided key, padding with 0s or truncating.
  for (let i = 0; i < keyBuffer.length; i++) {
    if (i < encodedKey.length) {
      keyBuffer[i] = encodedKey[i];
    }
  }

  return window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext string using AES-GCM with the global encryption key.
 * @param {string} plaintext - The text to encrypt.
 * @returns {Promise<{ encrypted: string; iv: string }>} - The encrypted data and IV, both as Base64 strings.
 */
export async function encrypt(plaintext: string): Promise<{ encrypted: string; iv: string }> {
  try {
    const key = await getCryptoKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV is standard for AES-GCM
    const encodedPlaintext = new TextEncoder().encode(plaintext);

    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedPlaintext
    );

    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedContent)));
    const ivBase64 = btoa(String.fromCharCode(...iv));

    return { encrypted: encryptedBase64, iv: ivBase64 };
  } catch (e) {
    console.error("Encryption failed:", e);
    throw new Error("Failed to encrypt password. Please try again.");
  }
}

/**
 * Decrypts an AES-GCM encrypted string with the global encryption key.
 * @param {string} encryptedBase64 - The Base64 encoded encrypted text.
 * @param {string} ivBase64 - The Base64 encoded IV.
 * @returns {Promise<string>} - The decrypted plaintext.
 */
export async function decrypt(encryptedBase64: string, ivBase64: string): Promise<string> {
  try {
    const key = await getCryptoKey();
    
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const encryptedData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );

    return new TextDecoder().decode(decryptedContent);
  } catch (e) {
    console.error("Decryption failed. This could be due to an invalid key or corrupted data.", e);
    throw new Error("Decryption failed. The data may be corrupted or the key invalid.");
  }
}
