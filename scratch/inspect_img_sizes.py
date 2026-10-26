import os
from PIL import Image

for f in sorted(os.listdir('docs/images')):
    if f.endswith('.png'):
        p = os.path.join('docs/images', f)
        im = Image.open(p)
        print(f"{f}: {im.size}, mode={im.mode}")
