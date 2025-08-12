# Feature Branch Setup for Image Generation

## Step 1: Create Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/image-generation

# Verify you're on the new branch
git branch
```

## Step 2: Commit Current Changes

```bash
# Add all the new files
git add n8n-workflows/generate_image_prompts.js
git add n8n-workflows/process_image_generation.js
git add n8n-workflows/test_v5_with_images_corrected.json
git add IMAGE_GENERATION_IMPLEMENTATION.md
git add FEATURE_BRANCH_SETUP.md

# Commit the n8n workflow changes
git commit -m "feat: Add image generation pipeline to n8n workflow

- Add generate_image_prompts.js node for creating detailed prompts
- Add process_image_generation.js node for handling results
- Create test_v5_with_images_corrected.json workflow with proper OpenAI integration
- Implement proper workflow: generate prompts -> split trends -> generate images -> process results
- Use imageprompt.md template for detailed prompt generation
- Include comprehensive documentation"
```

## Step 3: Test N8N Workflow (Step 1)

### 3.1 Import Updated Workflow
1. Open n8n
2. Import `n8n-workflows/test_v5_with_images_corrected.json`
3. Verify the workflow has these nodes in order:
   - Finalize Trends
   - Generate Image Prompts (JavaScript node)
   - Split Trends for Image Generation (JavaScript node)
   - Generate Image (OpenAI node)
   - Process Image Results (JavaScript node)
4. Check that OpenAI credentials are available

### 3.2 Test with Small Batch
1. Temporarily modify the workflow to process only 2-3 trends
2. Run the workflow manually
3. Monitor the image generation process
4. Check the output JSON for `creative.imageUrl` fields

### 3.3 Verify Image Generation
```bash
# Check the generated trends JSON
# Look for creative.imageUrl fields
# Verify images are accessible via URLs
```

## Step 4: Frontend Updates (Step 2)

### 4.1 Add Frontend Changes
```bash
# Add frontend component updates
git add standalone-dashboard/src/components/TrendCrystalWithImage.tsx
git add standalone-dashboard/src/components/Scene.tsx
git add standalone-dashboard/src/types.ts
git add standalone-screens/src/components/TrendCard.tsx
git add standalone-screens/src/types.ts
git add standalone-screens/src/index.css

# Commit frontend changes
git commit -m "feat: Update frontend apps to use generated images

- Add TrendCrystalWithImage component for 3D dashboard
- Update Scene component with conditional image rendering
- Enhance TrendCard component with image display
- Add shimmer animations and responsive image sizing
- Update type definitions to include imageUrl
- Implement graceful fallback to geometric shapes"
```

### 4.2 Test Frontend Applications
1. Deploy to staging environment
2. Test both URLs:
   - 3D Dashboard: `https://strategic-trends-dashboard-standalo.vercel.app/`
   - Screens App: `https://strategic-trends-dashboard-standalo.vercel.app/?screens`
3. Verify image loading and fallback behavior

## Step 5: Testing Checklist

### 5.1 N8N Workflow Testing
- [ ] Image generation node processes trends correctly
- [ ] Unique prompts are generated using trend data
- [ ] Rate limiting works (1 second between requests)
- [ ] Error handling works for failed generations
- [ ] Output JSON includes `creative.imageUrl` fields
- [ ] Images are accessible via generated URLs

### 5.2 Frontend Testing
- [ ] 3D dashboard displays images when available
- [ ] Falls back to geometric shapes when no image
- [ ] Screens app shows images with proper styling
- [ ] Responsive design works on different screen sizes
- [ ] Performance remains acceptable with image loading
- [ ] Error handling works for failed image loads

### 5.3 Integration Testing
- [ ] End-to-end workflow from RSS to images
- [ ] Both frontend apps receive updated data
- [ ] Image URLs are valid and accessible
- [ ] Cost monitoring shows expected API usage

## Step 6: Merge Strategy

### 6.1 If Testing Successful
```bash
# Switch back to main
git checkout main

# Merge feature branch
git merge feature/image-generation

# Push to main
git push origin main

# Delete feature branch
git branch -d feature/image-generation
```

### 6.2 If Issues Found
```bash
# Stay on feature branch
# Fix issues
# Test again
# Repeat until successful
```

## Step 7: Rollback Plan

If issues arise in production:

### 7.1 Quick Rollback
```bash
# Revert to previous commit
git revert HEAD

# Deploy rollback
git push origin main
```

### 7.2 N8N Rollback
1. Switch back to `test_v5.json` workflow
2. Remove image generation node
3. Verify original functionality works

## Monitoring & Maintenance

### 8.1 Cost Monitoring
- Monitor OpenAI API usage
- Set up alerts for cost thresholds
- Track image generation success rates

### 8.2 Performance Monitoring
- Monitor frontend load times
- Track image loading performance
- Monitor user engagement metrics

### 8.3 Error Tracking
- Monitor image generation failures
- Track frontend image loading errors
- Set up alerts for critical failures

## Next Steps After Successful Deployment

1. **Optimization**: Implement image caching and compression
2. **Analytics**: Add tracking for image vs. shape engagement
3. **Enhancement**: Consider image variation generation
4. **Scaling**: Optimize for larger trend volumes
