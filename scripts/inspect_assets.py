import sys
try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'Pillow'])
    from PIL import Image

img = Image.open('public/guardian-sprites.jpg')
print(f'Guardian: {img.size}')
img2 = Image.open('public/master-chest.jpg')
print(f'Chest: {img2.size}')
