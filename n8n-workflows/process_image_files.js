// Process image files returned by LangChain OpenAI node
// The LangChain node returns actual PNG files, not URLs

const inputItems = $input.all();

console.log(`🖼️ Processing ${inputItems.length} image files from LangChain OpenAI node`);

// Process each image file
const imageResults = [];
inputItems.forEach((item, index) => {
  console.log(`\n📋 Processing item ${index + 1}:`);
  
  // Check if this is an image file
  if (item.json && item.json.fileName === 'data' && item.json.mimeType === 'image/png') {
    console.log(`✅ Found PNG image file: ${item.json.fileName}.${item.json.fileExtension}`);
    console.log(`📏 File size: ${item.json.fileSize}`);
    
    // For now, we'll create a placeholder since we can't directly use the binary data
    // In a production workflow, you'd want to upload these files to get URLs
    imageResults.push({
      index: index,
      fileName: item.json.fileName,
      fileExtension: item.json.fileExtension,
      mimeType: item.json.mimeType,
      fileSize: item.json.fileSize,
      hasImage: true,
      // Note: The actual image data is in item.binary.data
      message: "Image file received - needs to be uploaded to get URL"
    });
  } else {
    console.log(`❌ Not an image file or unexpected format`);
    console.log(`Type: ${typeof item.json}`);
    console.log(`Keys: ${Object.keys(item.json || {}).join(', ')}`);
    imageResults.push({
      index: index,
      hasImage: false,
      message: "No image file found"
    });
  }
});

console.log(`\n📊 Summary: Found ${imageResults.filter(r => r.hasImage).length} image files out of ${imageResults.length} items`);

// For now, return the file information
// In a real implementation, you'd upload these files to get URLs
return [{
  json: {
    imageFiles: imageResults,
    totalFiles: imageResults.length,
    successfulFiles: imageResults.filter(r => r.hasImage).length,
    message: "Image files received. Need to implement file upload to get URLs.",
    nextStep: "Upload files to cloud storage (S3, Cloudinary, etc.) to get URLs"
  }
}];
