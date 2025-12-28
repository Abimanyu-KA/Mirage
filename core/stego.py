import random
import hashlib
import json
import base64
import zlib
from PIL import Image
from core.crypto import CryptoManager

class StegoEngine:
    def __init__(self):
        self.crypto = CryptoManager()

    def _get_stable_seed(self, pin):
        hash_object = hashlib.sha256(pin.encode())
        return int(hash_object.hexdigest(), 16)

    def _get_random_coords(self, width, height, pin):
        coords = [(x, y) for y in range(height) for x in range(width)]
        seed_val = self._get_stable_seed(pin)
        random.seed(seed_val)
        random.shuffle(coords)
        return coords

    def _prepare_payload_bits(self, message, file_bytes, filename, pin):
        """
        1. JSON Wrap -> 2. Compress -> 3. Encrypt -> 4. Convert to Bits
        """
        # A. Create JSON Payload
        if file_bytes:
            # Convert file bytes to Base64 string for JSON safety
            b64_data = base64.b64encode(file_bytes).decode('utf-8')
            payload = {"type": "file", "name": filename, "data": b64_data}
        else:
            payload = {"type": "text", "data": message}
            
        json_str = json.dumps(payload)
        
        # B. Compress (Zlib)
        # This converts the long JSON string into smaller raw bytes
        compressed_data = zlib.compress(json_str.encode('utf-8'))
        
        # C. Encrypt
        # Pass the compressed bytes directly to crypto
        salt, encrypted_data = self.crypto.encrypt(compressed_data, pin)
        
        # D. Convert to Bits
        salt_bits = "".join([f'{byte:08b}' for byte in salt])
        length_bits = f'{len(encrypted_data):032b}'
        body_bits = "".join([f'{byte:08b}' for byte in encrypted_data])
        
        return salt_bits + length_bits + body_bits

    def encode(self, image_stream, pin, message=None, file_bytes=None, filename=None, mode='secret', decoy_message=None, decoy_pin=None):
        # 1. Load Image
        img = Image.open(image_stream).convert("RGB")
        width, height = img.size
        pixels = img.load()
        
        # Helper to run the embedding loop
        def embed_layer(msg, f_bytes, f_name, p, layer_mode):
            # Generate Bits
            bits = self._prepare_payload_bits(msg, f_bytes, f_name, p)
            data_len = len(bits)
            
            # --- CHANNEL STRATEGY ---
            # If it's a "Secret" layer AND no decoy is active, use RGB (Capacity Boost)
            # If it's a "Decoy" layer, stick to Single Channel (Safe Mode)
            
            # Note: For simplicity in Dual Mode, we force Single Channel to avoid collision
            is_dual_mode = (decoy_pin is not None)
            
            if layer_mode == 'secret' and not is_dual_mode:
                target_channels = [0, 1, 2] # RGB (3x Capacity)
            elif layer_mode == 'decoy':
                target_channels = [0] # Red (Standard)
            else:
                target_channels = [2] # Blue (Standard for Secret in Dual Mode)

            # Capacity Check
            max_capacity = width * height * len(target_channels)
            if data_len > max_capacity:
                raise ValueError(f"Data too big. Needs {data_len} bits, image has {max_capacity}.")

            # Chaos Shuffle
            scatter_coords = self._get_random_coords(width, height, p)

            bit_idx = 0
            pixel_idx = 0
            
            while bit_idx < data_len:
                x, y = scatter_coords[pixel_idx]
                pixel = list(pixels[x, y])
                
                for c in target_channels:
                    if bit_idx < data_len:
                        current_val = pixel[c]
                        bit = int(bits[bit_idx])
                        pixel[c] = (current_val & 254) | bit
                        bit_idx += 1
                
                pixels[x, y] = tuple(pixel)
                pixel_idx += 1

        # 2. Execute Embedding
        # Embed Secret Layer
        embed_layer(message, file_bytes, filename, pin, 'secret')
        
        # Embed Decoy Layer (If exists)
        if decoy_message and decoy_pin:
            embed_layer(decoy_message, None, None, decoy_pin, 'decoy')
            
        return img

    def decode(self, image_stream, pin):
        img = Image.open(image_stream)
        pixels = img.load()
        width, height = img.size
        
        # We need to try decoding with 3 strategies:
        # 1. RGB Mode (High Capacity Secret)
        # 2. Blue Mode (Standard Secret)
        # 3. Red Mode (Decoy)
        strategies = [
            {'channels': [0, 1, 2], 'name': 'RGB'},
            {'channels': [2], 'name': 'Blue'},
            {'channels': [0], 'name': 'Red'}
        ]
        
        scatter_coords = self._get_random_coords(width, height, pin)
        
        for strategy in strategies:
            channels = strategy['channels']
            try:
                # 1. Read Bits
                def bit_generator():
                    for x, y in scatter_coords:
                        pixel = pixels[x, y]
                        for c in channels:
                            yield str(pixel[c] & 1)

                bit_gen = bit_generator()
                
                # 2. Read Header
                header_bits = ""
                for _ in range(160): 
                    header_bits += next(bit_gen)
                
                salt_bits = header_bits[:128]
                length_bits = header_bits[128:160]
                msg_len = int(length_bits, 2)
                
                # Sanity Check
                if msg_len > 100000000 or msg_len < 0:
                    continue # Garbage data, try next strategy

                # 3. Read Body
                body_bits = ""
                for _ in range(msg_len * 8):
                    body_bits += next(bit_gen)
                    
                # 4. Decrypt
                def bits_to_bytes(bits):
                    data = bytearray()
                    for i in range(0, len(bits), 8):
                        data.append(int(bits[i:i+8], 2))
                    return bytes(data)

                salt = bits_to_bytes(salt_bits)
                encrypted = bits_to_bytes(body_bits)
                
                # Returns raw compressed bytes
                decrypted_compressed = self.crypto.decrypt(salt, encrypted, pin)
                
                if not decrypted_compressed:
                    continue

                # 5. Decompress
                try:
                    json_str = zlib.decompress(decrypted_compressed).decode('utf-8')
                except Exception:
                    continue # Decompression failed

                # 6. Parse JSON
                payload = json.loads(json_str)
                is_decoy = (strategy['name'] == 'Red')
                
                if payload["type"] == "file":
                    return {
                        "type": "file",
                        "filename": payload["name"],
                        "content": payload["data"], # Base64 string
                        "is_decoy": is_decoy
                    }
                else:
                    return {
                        "type": "text", 
                        "message": payload["data"], 
                        "is_decoy": is_decoy
                    }

            except Exception:
                continue
                
        return "WRONG_PIN"