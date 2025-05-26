const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const heicConvert = require('heic-convert');

async function convertHeicToJpg(inputPath, outputPath) {
  try {
    const inputBuffer = await fs.readFile(inputPath);
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 1
    });

    await sharp(outputBuffer)
      .resize(800, 800, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    console.log(`Converted ${inputPath} to ${outputPath}`);
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error);
  }
}

async function processDirectory() {
  const officersDir = path.join(process.cwd(), 'public', 'officers');
  const files = await fs.readdir(officersDir);

  for (const file of files) {
    if (file.toLowerCase().endsWith('.heic')) {
      const inputPath = path.join(officersDir, file);
      const outputPath = path.join(officersDir, `${path.parse(file).name}.jpg`);
      await convertHeicToJpg(inputPath, outputPath);
    }
  }
}

processDirectory().catch(console.error); 