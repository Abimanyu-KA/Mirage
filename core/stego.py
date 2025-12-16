from PIL import Image
from core.crypto import CryptoManager

class StegoEngine:
    def __init__(self):
        self.crypto = CryptoManager()

    def _msg_to_bin(self, message, pin):
        """
        Prepares the binary payload: [SALT (128 bits)] + [LENGTH (32 bits)] + [BODY]
        """
        # 1. Encrypt
        salt, encrypted_data = self.crypto.encrypt(message, pin)
        
        # 2. Salt to binary
        salt_bits = "".join([f'{byte:08b}' for byte in salt])
        
        # 3. Length to binary
        length_bits = f'{len(encrypted_data):032b}'
        
        # 4. Body to binary
        body_bits = "".join([f'{byte:08b}' for byte in encrypted_data])
        
        return salt_bits + length_bits + body_bits

    def encode(self, image_path, message, pin, save_path=None, channel_mode='secret'):
        """
        Embeds data into image.
        channel_mode: 'decoy' (Red channel) or 'secret' (Blue channel)
        """
        channel_idx = 0 if channel_mode == 'decoy' else 2
        
        # 1. Prepare Data
        binary_data = self._msg_to_bin(message, pin)
        data_len = len(binary_data)
        
        # 2. Open Image
        img = Image.open(image_path)
        img = img.convert("RGB")
        pixels = img.load()
        width, height = img.size
        
        if data_len > width * height:
            raise ValueError(f"Message too long for this image.")

        # 3. Embed Data
        data_index = 0
        for y in range(height):
            for x in range(width):
                if data_index < data_len:
                    pixel = list(pixels[x, y])
                    
                    # Modify the specific channel LSB
                    current_val = pixel[channel_idx]
                    bit = int(binary_data[data_index])
                    
                    # Bitwise Logic: Clear LSB, Set new bit
                    new_val = (current_val & 254) | bit
                    pixel[channel_idx] = new_val
                    
                    pixels[x, y] = tuple(pixel)
                    data_index += 1
                else:
                    break
            if data_index >= data_len:
                break
        
        # 4. Return Object or Save File
        if save_path:
            img.save(save_path)
            print(f"Saved to {save_path}")
        
        return img

    def decode(self, image_path, pin, channel_mode='secret'):
        """
        Extracts and decrypts. Returns 'WRONG_PIN' if decryption fails.
        """
        channel_idx = 0 if channel_mode == 'decoy' else 2
        
        img = Image.open(image_path)
        pixels = img.load()
        width, height = img.size
        
        # Generator to read bits from pixels
        def bit_generator():
            for y in range(height):
                for x in range(width):
                    pixel = pixels[x, y]
                    yield str(pixel[channel_idx] & 1)

        bit_gen = bit_generator()
        
        # 1. Read Header (128 bits Salt + 32 bits Length)
        header_bits = ""
        header_total = 128 + 32
        try:
            for _ in range(header_total):
                header_bits += next(bit_gen)
        except StopIteration:
            return "Error: No data found."

        salt_bits = header_bits[:128]
        length_bits = header_bits[128:160]
        
        try:
            msg_len = int(length_bits, 2)
        except ValueError:
            return "Error: Corrupt header."

        # Sanity check on length
        if msg_len > (width * height * 8) or msg_len < 0:
            return "Error: Invalid message length detected."

        # 2. Read Body
        body_bits = ""
        needed_bits = msg_len * 8
        try:
            for _ in range(needed_bits):
                body_bits += next(bit_gen)
        except StopIteration:
            return "Error: Image truncated."

        # 3. Convert Bits -> Bytes
        def bits_to_bytes(bits):
            data = bytearray()
            for i in range(0, len(bits), 8):
                data.append(int(bits[i:i+8], 2))
            return bytes(data)

        salt_bytes = bits_to_bytes(salt_bits)
        encrypted_bytes = bits_to_bytes(body_bits)

        # 4. Decrypt
        decrypted_text = self.crypto.decrypt(salt_bytes, encrypted_bytes, pin)
        
        if decrypted_text is None:
            return "WRONG_PIN"
            
        return decrypted_text