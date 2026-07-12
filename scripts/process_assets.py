import os
import sys

def install_deps():
    try:
        import rembg
        import PIL
        import numpy
        import cv2
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "rembg", "Pillow", "numpy", "opencv-python"])

install_deps()

from PIL import Image
import numpy as np
import cv2
from rembg import remove

def process_chest():
    print("Processing master chest...")
    input_path = "public/master-chest.jpg"
    img = Image.open(input_path)
    
    # Remove background
    chest_no_bg = remove(img)
    chest_no_bg.save("public/master-chest.png")
    
    # Convert to cv2 format (BGRA)
    open_cv_image = np.array(chest_no_bg) 
    # Convert RGB to BGR 
    open_cv_image = open_cv_image[:, :, ::-1].copy()
    
    # Convert to HSV to isolate the gems
    hsv = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2HSV)
    
    # The gems in the original image are red/pink, green, and blue.
    # The user wants three chests where ALL gems are replaced with a single color.
    # Let's create a mask of all gems.
    # Red/Pink mask
    lower_red1 = np.array([0, 100, 50])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([160, 100, 50])
    upper_red2 = np.array([180, 255, 255])
    mask_red = cv2.bitwise_or(cv2.inRange(hsv, lower_red1, upper_red1), cv2.inRange(hsv, lower_red2, upper_red2))
    
    # Green mask
    lower_green = np.array([35, 50, 50])
    upper_green = np.array([85, 255, 255])
    mask_green = cv2.inRange(hsv, lower_green, upper_green)
    
    # Blue mask
    lower_blue = np.array([90, 50, 50])
    upper_blue = np.array([130, 255, 255])
    mask_blue = cv2.inRange(hsv, lower_blue, upper_blue)
    
    # Combine masks to get all gems
    mask_all_gems = cv2.bitwise_or(mask_red, cv2.bitwise_or(mask_green, mask_blue))
    
    # Create variants by shifting Hue of the gems
    def create_variant(target_hue, name):
        hsv_variant = hsv.copy()
        
        # We need to normalize saturation and value slightly so they look consistent, but a simple hue shift on the masked area is enough
        # Actually, if we just set the Hue of the masked area to the target hue:
        hsv_variant[mask_all_gems > 0, 0] = target_hue
        
        # Convert back to BGR
        variant_bgr = cv2.cvtColor(hsv_variant, cv2.COLOR_HSV2BGR)
        
        # Convert back to BGRA (keep original alpha)
        variant_bgra = cv2.cvtColor(variant_bgr, cv2.COLOR_BGR2BGRA)
        variant_bgra[:, :, 3] = open_cv_image[:, :, 3]
        
        # Save
        Image.fromarray(cv2.cvtColor(variant_bgra, cv2.COLOR_BGRA2RGBA)).save(f"public/chest-{name}.png")
        print(f"Saved {name} chest.")

    create_variant(0, "red") # Red hue is 0
    create_variant(60, "green") # Green hue is ~60 in OpenCV (0-179 range)
    create_variant(110, "blue") # Blue hue is ~110 in OpenCV

def process_guardian():
    print("Processing guardian sprites...")
    input_path = "public/guardian-sprites.jpg"
    img = Image.open(input_path)
    
    width, height = img.size
    # Assuming 4x4 grid based on 1024x1024 size
    cols, rows = 4, 4
    
    tile_w = width // cols
    tile_h = height // rows
    
    pose_idx = 1
    for r in range(rows):
        for c in range(cols):
            # Crop
            left = c * tile_w
            upper = r * tile_h
            right = left + tile_w
            lower = upper + tile_h
            tile = img.crop((left, upper, right, lower))
            
            # Remove background
            tile_no_bg = remove(tile)
            
            tile_no_bg.save(f"public/guardian-pose-{pose_idx}.png")
            print(f"Saved pose {pose_idx}")
            pose_idx += 1

if __name__ == "__main__":
    process_chest()
    process_guardian()
    print("Done!")
