from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import StreamingResponse
from io import BytesIO
from core.stego import StegoEngine
from core.glitch import create_glitch_art

app = FastAPI()
engine = StegoEngine()

@app.get("/")
def home():
    return {"status": "Mirage System Online"}

@app.post("/api/encode")
async def encode_route(
    file: UploadFile, 
    message: str = Form(...), 
    pin: str = Form(...), 
    mode: str = Form("secret")
):
    request_object_content = await file.read()
    image_stream = BytesIO(request_object_content)

    # Encode (returns PIL Image object)
    stego_img = engine.encode(image_stream, message, pin, save_path=None, channel_mode=mode)

    # Convert to stream for response
    output_buffer = BytesIO()
    stego_img.save(output_buffer, format="PNG")
    output_buffer.seek(0)

    return StreamingResponse(output_buffer, media_type="image/png")

@app.post("/api/decode")
async def decode_route(
    file: UploadFile, 
    pin: str = Form(...), 
    mode: str = Form("secret")
):
    request_object_content = await file.read()
    image_stream = BytesIO(request_object_content)

    result = engine.decode(image_stream, pin, channel_mode=mode)

    if result == "WRONG_PIN" or (isinstance(result, str) and result.startswith("Error")):
        # TRIGGER GLITCH
        image_stream.seek(0)
        glitched_img = create_glitch_art(image_stream, intensity=0.8)
        
        glitch_buffer = BytesIO()
        glitched_img.save(glitch_buffer, format="PNG")
        glitch_buffer.seek(0)
        
        return StreamingResponse(glitch_buffer, media_type="image/png")

    return {"status": "success", "message": result}