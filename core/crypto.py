import os
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class CryptoManager:
    def __init__(self):
        # AES-GCM requires a 12-byte nonce
        self.nonce_len = 12

    def _derive_key(self, pin: str, salt: bytes) -> bytes:
        """Derives a 32-byte (256-bit) AES key from the PIN using PBKDF2."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return kdf.derive(pin.encode())

    def encrypt(self, data, pin: str):
        """
        Encrypts text OR bytes.
        Returns: (salt, encrypted_data)
        """
        # 1. Generate a random salt
        salt = os.urandom(16)
        
        # 2. Derive the key
        key = self._derive_key(pin, salt)
        
        # 3. Prepare data (The Fix: Handle both str and bytes)
        if isinstance(data, str):
            data_bytes = data.encode('utf-8')
        elif isinstance(data, bytes):
            data_bytes = data
        else:
            raise ValueError("Data must be string or bytes.")

        # 4. Encrypt using AES-GCM
        aesgcm = AESGCM(key)
        nonce = os.urandom(self.nonce_len)
        ciphertext = aesgcm.encrypt(nonce, data_bytes, None)
        
        # Return: salt, (nonce + ciphertext)
        # We need the nonce to decrypt, so we prepend it to the ciphertext
        return salt, nonce + ciphertext

    def decrypt(self, salt: bytes, encrypted_data: bytes, pin: str):
        """
        Decrypts data. Returns bytes (to support files/compression).
        """
        try:
            # 1. Derive the key again
            key = self._derive_key(pin, salt)
            
            # 2. Split nonce and ciphertext
            nonce = encrypted_data[:self.nonce_len]
            ciphertext = encrypted_data[self.nonce_len:]
            
            # 3. Decrypt
            aesgcm = AESGCM(key)
            decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)
            
            return decrypted_bytes # Return raw bytes!
            
        except Exception:
            # If PIN is wrong or data is corrupt, this fails
            return None