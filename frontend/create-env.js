import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `VITE_BACKEND_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Content:');
  console.log(envContent);
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('📝 Please create a .env file manually with the following content:');
  console.log(envContent);
} 