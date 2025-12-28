from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import StreamingResponse
from io import BytesIO
from core.stego import StegoEngine
from core.glitch import create_glitch_art
from typing import Optional

# Initialize the app and the engine
app = FastAPI()
engine = StegoEngine()

@app.get("/")
def home():
    return {"status": "Mirage System Online", "version": "1.1.0 (Chaos+Decoy)"}

@app.post("/api/encode")
async def encode_route(
    file: UploadFile, 
    pin: str = Form(...), 
    mode: str = Form("secret"),
    message: str = Form(None),           # Optional now
    secret_file: UploadFile = None       # NEW: The file to hide
):
    request_object_content = await file.read()
    image_stream = BytesIO(request_object_content)

    # Logic: Are we hiding Text or a File?
    if secret_file:
        file_bytes = await secret_file.read()
        filename = secret_file.filename
        stego_img = engine.encode(image_stream, pin, file_bytes=file_bytes, filename=filename, mode=mode)
    elif message:
        stego_img = engine.encode(image_stream, pin, message=message, mode=mode)
    else:
        return {"error": "No content provided"}

    output_buffer = BytesIO()
    stego_img.save(output_buffer, format="PNG")
    output_buffer.seek(0)

    return StreamingResponse(output_buffer, media_type="image/png")

@app.post("/api/decode")
async def decode_route(file: UploadFile, pin: str = Form(...)):
    request_object_content = await file.read()
    image_stream = BytesIO(request_object_content)
    
    # Engine now returns a Dictionary (JSON) or "WRONG_PIN"
    result = engine.decode(image_stream, pin)

    if result == "WRONG_PIN":
        # Glitch Logic (Same as before)
        image_stream.seek(0)
        glitched_img = create_glitch_art(image_stream, intensity=0.7)
        glitch_buffer = BytesIO()
        glitched_img.save(glitch_buffer, format="PNG")
        glitch_buffer.seek(0)
        return StreamingResponse(glitch_buffer, media_type="image/png")

    return result # Returns JSON: {"type": "file", "filename": "...", "content": "..."}