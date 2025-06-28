// AES encryption/decryption using Web Crypto API (simple wrapper)
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function aesEncrypt(text, password) {
  const pwUtf8 = new TextEncoder().encode(password);
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const alg = { name: 'AES-GCM', iv };
  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);
  const ptUint8 = new TextEncoder().encode(text);
  const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);
  return {
    iv: Array.from(iv),
    ct: Array.from(new Uint8Array(ctBuffer))
  };
}

async function aesDecrypt(encrypted, password) {
  const pwUtf8 = new TextEncoder().encode(password);
  const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
  const iv = new Uint8Array(encrypted.iv);
  const alg = { name: 'AES-GCM', iv };
  const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
  const ctUint8 = new Uint8Array(encrypted.ct);
  const ptBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);
  return new TextDecoder().decode(ptBuffer);
}

// Export for app.js
window.CryptoUtils = { sha256, aesEncrypt, aesDecrypt }; 