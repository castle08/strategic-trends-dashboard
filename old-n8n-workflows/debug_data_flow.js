// Debug Data Flow - Add this to ANY node to see what data it receives
const inputData = $input.first().json;

console.log('🔍 === DEBUG DATA FLOW ===');
console.log('📝 Input data received:');
console.log('Keys:', Object.keys(inputData));
console.log('Title:', inputData.title);
console.log('URL:', inputData.url);
console.log('Source:', inputData.source);
console.log('Summary length:', (inputData.summary || '').length);
console.log('Raw data sample:', JSON.stringify(inputData, null, 2).substring(0, 500));
console.log('🔍 === END DEBUG ===');

// Pass data through unchanged
return [{ json: inputData }];