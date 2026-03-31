import 'dotenv/config.js';
import { put } from '@vercel/blob';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Debug: Show if token is loaded
console.log('Token check:', process.env.BLOB_READ_WRITE_TOKEN ? '✓ Loaded' : '✗ Not found');

const VIDEOS_DIR = './public/videos';

async function uploadVideos() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (!token) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN not found in environment variables');
    console.log('\n📝 To get your token:');
    console.log('1. Go to https://vercel.com/account/stores/blob');
    console.log('2. Create a new Blob store named "videos"');
    console.log('3. Copy the token and add it to .env.local as BLOB_READ_WRITE_TOKEN');
    process.exit(1);
  }

  try {
    const files = readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.mp4'));
    console.log(`📹 Found ${files.length} video files to upload\n`);

    const uploadedVideos = [];

    for (const file of files) {
      const filePath = join(VIDEOS_DIR, file);
      const fileBuffer = readFileSync(filePath);
      
      console.log(`⏳ Uploading ${file}...`);
      
      const blob = await put(file, fileBuffer, {
        access: 'public',
      });

      uploadedVideos.push({
        name: file,
        url: blob.url,
      });

      console.log(`✅ ${file}`);
      console.log(`   URL: ${blob.url}\n`);
    }

    console.log('\n📋 Video URLs for SWork.astro:');
    console.log('================================\n');

    uploadedVideos.forEach(video => {
      console.log(`  { caption: '${video.name.replace('.mp4', '')}', site: '#', src: '${video.url}' },`);
    });

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

uploadVideos();
