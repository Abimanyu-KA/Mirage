import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class CryptoManager:
    def __init__(self):
        pass

    def derive_key(self, pin: str, salt: bytes = None):
        """
        Turns a PIN into a 32-byte URL-safe key using PBKDF2.
        """
        if salt is None:
            # Generate a new random 16-byte salt if encoding
            salt = os.urandom(16)
        
        # PBKDF2: Industry standard for hashing passwords
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        
        key = base64.urlsafe_b64encode(kdf.derive(pin.encode()))
        return key, salt

    def encrypt(self, message: str, pin: str):
        # 1. Derive key
        key, salt = self.derive_key(pin)
        f = Fernet(key)
        
        # 2. Encrypt
        encrypted_data = f.encrypt(message.encode())
        
        # 3. Return salt (needed for decrypt) + data
        return salt, encrypted_data

    def decrypt(self, salt: bytes, encrypted_data: bytes, pin: str):
        # 1. Re-derive key
        key, _ = self.derive_key(pin, salt)
        f = Fernet(key)
        
        try:
            # 2. Attempt decrypt
            return f.decrypt(encrypted_data).decode()
        except Exception:
            # Wrong PIN or corrupted data
            return None