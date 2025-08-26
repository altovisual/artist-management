// A salt is a random value used to make dictionary attacks on passwords harder.
// For this application, we'll use a static salt. In a real-world, multi-user
// system, you might derive this from something unique and non-secret per user,
// like their user ID.
const SALT = new TextEncoder().encode('artist-management-salt');
const ITERATIONS = 100000; // Standard number of iterations for PBKDF2

/**
 * Derives a cryptographic key from a master password.
 * @param {string} password - The user's master password.
 * @returns {Promise<CryptoKey>} - The derived cryptographic key.
 */
async function deriveKey(password: string): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext string using AES-GCM.
 * @param {string} plaintext - The text to encrypt.
 * @param {string} masterPassword - The user's master password.
 * @returns {Promise<{ encrypted: string; iv: string }>} - The encrypted data and IV, both as Base64 strings.
 */
export async function encrypt(plaintext: string, masterPassword: string): Promise<{ encrypted: string; iv: string }> {
  const key = await deriveKey(masterPassword);
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

  const encryptedBase64 = btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedContent)));
  const ivBase64 = btoa(String.fromCharCode.apply(null, iv));

  return { encrypted: encryptedBase64, iv: ivBase64 };
}

/**
 * Decrypts an AES-GCM encrypted string.
 * @param {string} encryptedBase64 - The Base64 encoded encrypted text.
 * @param {string} ivBase64 - The Base64 encoded IV.
 * @param {string} masterPassword - The user's master password.
 * @returns {Promise<string>} - The decrypted plaintext.
 */
export async function decrypt(encryptedBase64: string, ivBase64: string, masterPassword: string): Promise<string> {
  try {
    const key = await deriveKey(masterPassword);
    
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
    console.error("Decryption failed. Likely incorrect master password.", e);
    throw new Error("Decryption failed. The master password may be incorrect.");
  }
}
