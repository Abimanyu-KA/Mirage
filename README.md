# 👁️ MIRAGE_OS // Polyglot Steganography Suite

![Version](https://img.shields.io/badge/version-2.0.0-green) ![Security](https://img.shields.io/badge/security-AES256-blue) ![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20FastAPI-black)

**Mirage Protocol** is an advanced steganography engine designed to smuggle encrypted data through image carrier files. Unlike traditional LSB tools that leave linear statistical footprints, Mirage utilizes a custom **Chaos Engine** to scatter payload bits stochastically across the canvas, making detection exponentially harder.

It features **Plausible Deniability** via dual-layer embedding, allowing users to reveal a "decoy" message under duress while keeping the true payload cryptographically invisible.

---

## ⚡ Key Capabilities

### 1. The Chaos Engine (Non-Linear Embedding)
Standard steganography writes data sequentially (pixel 0,0 to 0,1...), creating predictable noise patterns.
* **Mirage Logic:** Uses a **PRNG (Pseudo-Random Number Generator)** seeded by the user's PIN to generate a unique coordinate map for every image.
* **Result:** Data is scattered like dust. Without the exact PIN, the bits appear as random sensor noise.

### 2. The Decoy Protocol (Plausible Deniability)
Supports **Dual-Channel Polyglot Embedding**:
* **Layer 1 (Red Channel):** Stores a fake "Decoy" message (accessible with a weak PIN).
* **Layer 2 (Blue Channel):** Stores the high-value "Secret" payload (accessible only with the true PIN).
* *Scenario:* If forced to decrypt the image, the user provides the weak PIN, revealing the decoy. The system behaves normally, and the attacker remains unaware of the second layer.

### 3. The Smuggler (Binary Injection)
Goes beyond simple text hiding. Mirage includes a **Binary-to-Image** pipeline that can ingest:
* PDFs, ZIP archives, Audio files, or Executables.
* **Pipeline:** `Raw File` -> `Zlib Compression` -> `AES-256 Encryption` -> `Base64 Wrapper` -> `LSB Injection`.

### 4. The Inspector (Forensic Analysis)
Built-in **Bit-Plane Slicer** to visualize the efficacy of the encryption.
* Extracts the LSB (Least Significant Bit) layer in real-time using the Canvas API.
* Allows users to visually compare "Clean" images vs. "Mirage" images to verify the randomness of the noise floor.

---

## 🛠️ Tech Stack

### Frontend (Client)
* **Framework:** Next.js 14 (React)
* **Styling:** Tailwind CSS + Lucide Icons
* **Analysis:** HTML5 Canvas API (Pixel Buffer Manipulation)
* **State:** React Hooks for real-time capacity metering

### Backend (Server)
* **Runtime:** Python 3.10+
* **API:** FastAPI (Uvicorn)
* **Image Processing:** Pillow (PIL)
* **Cryptography:** `cryptography` library (PBKDF2HMAC + AES-GCM)
* **Compression:** Zlib

---

## 🚀 Installation & Setup

Mirage requires two terminals running simultaneously (Frontend + Backend).

### 1. Backend Setup (Python)
Navigate to the root directory:
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install fastapi "uvicorn[standard]" pillow cryptography python-multipart

# Start the API Server
uvicorn api.index:app --reload
```
Server will start on http://127.0.0.1:8000

### 2. Frontend Setup (Node.js)
Open a new terminal in the root directory:

```bash

# Install dependencies
npm install

# Start the Development Server
npm run dev
```
UI will start on http://localhost:3000

## 📖 Usage Guide
### Encoding (Hiding Data)
* Navigate to Encode.
* Upload a carrier image (PNG/JPG).
* Secret Layer: Enter your high-value message or upload a file (PDF/ZIP). Set a strong PIN.
* (Optional) Decoy Layer: Enable "Decoy Mode" and enter a fake message with a weak PIN.
* Click Encrypt & Embed. The system will download filename_mirage.png.

### Decoding (Extracting Data)
* Navigate to Decode.
* Upload the _mirage.png image.
* Enter a PIN:
* Fake PIN: System reveals the Decoy message (tagged as [DECOY DETECTED]).
* Real PIN: System decrypts and downloads the hidden Secret file.
* Wrong PIN: System returns a corrupted "Glitch Art" image.

## ⚖️ Disclaimer
Mirage_OS is a proof-of-concept security tool developed for educational purposes to demonstrate modern steganographic algorithms and cryptographic principles. The author is not responsible for any misuse of this software.
