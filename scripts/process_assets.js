const { Jimp, rgbaToInt, intToRGBA } = require('jimp');
const fs = require('fs');

async function processChest() {
    console.log("Processing master chest...");
    const image = await Jimp.read('public/master-chest.jpg');
    
    const bgColorInt = image.getPixelColor(0, 0);
    const bgColor = intToRGBA(bgColorInt);
    
    const tolerance = 40;
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        
        const dist = Math.sqrt(
            Math.pow(r - bgColor.r, 2) + 
            Math.pow(g - bgColor.g, 2) + 
            Math.pow(b - bgColor.b, 2)
        );
        
        if (dist < tolerance) {
            this.bitmap.data[idx + 3] = 0; 
        }
    });

    image.write('public/master-chest.png', () => {
        console.log("Saved master-chest.png");
    });
    
    async function createVariant(name) {
        const variant = await Jimp.read('public/master-chest.png');
        
        variant.scan(0, 0, variant.bitmap.width, variant.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            if (g > r || b > r || (g > 100 && b > 100 && r < 150)) {
                if (name === 'red') {
                    this.bitmap.data[idx + 0] = Math.max(g, b);
                    this.bitmap.data[idx + 1] = r;
                    this.bitmap.data[idx + 2] = r;
                } else if (name === 'blue') {
                    this.bitmap.data[idx + 0] = r;
                    this.bitmap.data[idx + 1] = g;
                    this.bitmap.data[idx + 2] = Math.max(g, b) + 50;
                } else if (name === 'green') {
                    this.bitmap.data[idx + 0] = r;
                    this.bitmap.data[idx + 1] = Math.max(g, b) + 50;
                    this.bitmap.data[idx + 2] = r;
                }
            }
        });
        
        variant.write(`public/chest-${name}.png`, () => {
             console.log(`Saved chest-${name}.png`);
        });
    }
    
    await createVariant('red');
    await createVariant('green');
    await createVariant('blue');
}

async function processGuardian() {
    console.log("Processing guardian sprites intelligently...");
    const image = await Jimp.read('public/guardian-sprites.jpg');
    
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    const bgColorInt = image.getPixelColor(0, 0);
    const bgColor = intToRGBA(bgColorInt);
    const tolerance = 40;
    
    console.log("1. Running BFS flood-fill for perfect background removal...");
    const queue = [];
    const visited = new Uint8Array(width * height);
    
    // Add border pixels to BFS queue
    for (let x = 0; x < width; x++) {
        queue.push({x, y: 0});
        queue.push({x, y: height - 1});
    }
    for (let y = 1; y < height - 1; y++) {
        queue.push({x: 0, y});
        queue.push({x: width - 1, y});
    }
    
    let head = 0;
    while (head < queue.length) {
        const {x, y} = queue[head++];
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const idx1D = y * width + x;
        if (visited[idx1D]) continue;
        visited[idx1D] = 1;
        
        const idx = (y * width + x) * 4;
        const r = image.bitmap.data[idx];
        const g = image.bitmap.data[idx + 1];
        const b = image.bitmap.data[idx + 2];
        
        const dist = Math.sqrt(
            Math.pow(r - bgColor.r, 2) + 
            Math.pow(g - bgColor.g, 2) + 
            Math.pow(b - bgColor.b, 2)
        );
        
        if (dist < tolerance) {
            image.bitmap.data[idx + 3] = 0; // Make transparent
            queue.push({x: x + 1, y});
            queue.push({x: x - 1, y});
            queue.push({x, y: y + 1});
            queue.push({x, y: y - 1});
        }
    }
    
    console.log("2. Scanning for exact bounding boxes...");
    const cols = 4;
    const rows = 4;
    const cellW = Math.floor(width / cols);
    const cellH = Math.floor(height / rows);
    
    const semanticNames = [
        "wave", "shocked", "thinking", "whisper",
        "pointing", "crossed_arms", "laughing", "sleeping",
        "peeking", "celebrating", "facepalm", "confused",
        "dizzy", "wink", "happy", "surprised"
    ];
    
    const sprites = [];
    let maxSpriteW = 0;
    let maxSpriteH = 0;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let minX = width, minY = height, maxX = 0, maxY = 0;
            let foundOpaque = false;
            
            for (let y = r * cellH; y < (r + 1) * cellH; y++) {
                for (let x = c * cellW; x < (c + 1) * cellW; x++) {
                    const alpha = image.bitmap.data[(y * width + x) * 4 + 3];
                    if (alpha > 0) {
                        foundOpaque = true;
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            
            if (foundOpaque) {
                const w = maxX - minX + 1;
                const h = maxY - minY + 1;
                if (w > maxSpriteW) maxSpriteW = w;
                if (h > maxSpriteH) maxSpriteH = h;
                
                const cropped = image.clone().crop({ x: minX, y: minY, w, h });
                sprites.push({
                    name: semanticNames[r * cols + c],
                    img: cropped,
                    w, h
                });
            }
        }
    }
    
    console.log("3. Standardizing canvas and bottom-centering...");
    const canvasW = Math.floor(maxSpriteW * 1.25);
    const canvasH = Math.floor(maxSpriteH * 1.25);
    
    for (const sprite of sprites) {
        if (!sprite.img) continue;
        
        // Create transparent canvas (fully transparent black: 0x00000000)
        const canvas = new Jimp({ width: canvasW, height: canvasH, color: 0x00000000 });
            
        const paddingBottom = Math.floor(canvasH * 0.05);
        const destX = Math.floor((canvasW - sprite.w) / 2);
        const destY = canvasH - sprite.h - paddingBottom;
        
        canvas.composite(sprite.img, destX, destY);
        
        const path = `public/guardian_${sprite.name}.png`;
        canvas.write(path, () => {
             console.log(`Saved ${path} (Canvas: ${canvasW}x${canvasH})`);
        });
    }
}

async function main() {
    try {
        await processGuardian();
        // Skip chest processing for speed since it's already done
        console.log("Script launched successfully.");
    } catch (err) {
        console.log("Error:", err ? (err.message || err) : "Unknown error");
    }
}

main();
