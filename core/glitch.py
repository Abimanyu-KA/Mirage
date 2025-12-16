import random
from PIL import Image, ImageOps

def create_glitch_art(image_source, intensity=0.5):
    """
    Takes an image (path or file object) and corrupts it visually.
    """
    # Load the image
    img = Image.open(image_source).convert('RGB')
    width, height = img.size
    pixels = img.load()

    # 1. Channel Split & Shift (RGB Separation)
    r, g, b = img.split()
    # Create distinct colors for channels
    r = ImageOps.colorize(r.convert("L"), (0,0,0), (255, 0, 0)).convert("RGB")
    g = ImageOps.colorize(g.convert("L"), (0,0,0), (0, 255, 0)).convert("RGB")
    
    # 2. Pixel Shifting (Glitch lines)
    for y in range(height):
        # Randomly shift rows based on intensity
        if random.random() < intensity:
            shift = random.randint(-50, 50)
            for x in range(width):
                if 0 <= x + shift < width:
                    pixels[x, y] = pixels[x + shift, y]

    # 3. Random Inversion Blocks
    for _ in range(int(10 * intensity)):
        x = random.randint(0, width - 50)
        y = random.randint(0, height - 50)
        # Invert a block
        for i in range(50):
            for j in range(50):
                if x+i < width and y+j < height:
                    r_val, g_val, b_val = pixels[x+i, y+j]
                    pixels[x+i, y+j] = (255-r_val, 255-g_val, 255-b_val)

    return img