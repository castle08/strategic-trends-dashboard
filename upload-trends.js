// Script to upload the current trends data to the Vercel API
import fs from 'fs';

const trendsData = JSON.parse(fs.readFileSync('apps/screens-app/public/trends/latest.json', 'utf8'));

fetch('https://strategic-trends-dashboard-standalone.vercel.app/api/trends', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(trendsData)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Trends data uploaded successfully:', data);
})
.catch(error => {
  console.error('❌ Failed to upload trends data:', error);
});