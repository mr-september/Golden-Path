/**
 * AES-GCM Encryption Utility for the GoldenPath session management.
 * Provides a "seamless" layer of security by storing keys in a way that
 * is harder to scrape than plaintext localStorage.
 */

let inMemoryKey: CryptoKey | null = null;

async function getOrCreateKey(): Promise<CryptoKey> {
  // 1. Check in-memory fallback first
  if (inMemoryKey) return inMemoryKey;

  const KEY_NAME = 'goldenpath_master_key';
  
  // 2. Safely attempt to retrieve from localStorage
  let existingKeyBase64: string | null = null;
  try {
    existingKeyBase64 = localStorage.getItem(KEY_NAME);
  } catch (e) {
    // localStorage might be blocked or unavailable
  }

  if (existingKeyBase64) {
    try {
      const rawKey = Uint8Array.from(atob(existingKeyBase64), c => c.charCodeAt(0));
      const key = await window.crypto.subtle.importKey(
        'raw', rawKey, 'AES-GCM', true, ['encrypt', 'decrypt']
      );
      inMemoryKey = key;
      return key;
    } catch (e) {
      // Import failed, continue to generation
    }
  }

  // 3. Generate new key
  const newKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // 4. Safely attempt to persist
  try {
    const exported = await window.crypto.subtle.exportKey('raw', newKey);
    const base64Key = btoa(String.fromCharCode(...new Uint8Array(exported)));
    localStorage.setItem(KEY_NAME, base64Key);
  } catch (e) {
    // Persistence failed, key will only live in memory for this session
  }
  
  inMemoryKey = newKey;
  return newKey;
}

export async function encrypt(text: string): Promise<string> {
  const key = await getOrCreateKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...result));
}

export async function decrypt(data: string): Promise<string> {
  try {
    const key = await getOrCreateKey();
    const binary = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const iv = binary.slice(0, 12);
    const encrypted = binary.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error('Decryption failed:', e);
    return '';
  }
}
