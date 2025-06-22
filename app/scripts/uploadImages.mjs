import cloudinary from '../lib/cloudinary.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory (equivalent to process.cwd() in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the public folder path
const publicFolder = path.join(__dirname, '../public');
// Define the folder in Cloudinary (optional)
const cloudinaryFolder = 'my_images';

async function uploadImages() {
  try {
    // Read all files in the public folder
    const files = await fs.readdir(publicFolder);

    // Filter for .png files
    const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');

    if (pngFiles.length === 0) {
      console.log('No PNG files found in the public folder.');
      return;
    }

    console.log(`Found ${pngFiles.length} PNG files to upload.`);

    for (const file of pngFiles) {
      const filePath = path.join(publicFolder, file);

      console.log(`Uploading ${file}...`);

      // Upload to Cloudinary with transformation to webp
      const result = await cloudinary.uploader.upload(filePath, {
        folder: cloudinaryFolder,
        resource_type: 'image',
        format: 'webp',
        public_id: path.basename(file, '.png'),
      });

      console.log(`Successfully uploaded ${file} as ${result.secure_url}`);
    }

    console.log('All images uploaded successfully!');
  } catch (error) {
    console.error('Error uploading images:', error);
  }
}

uploadImages();