# Image Generation API Updates

## Overview

The TOMO Chat application has been updated to use the following image generation services:

- **Google Imagen-4** via Replicate API (instead of direct Google GenAI)
- **Stability AI Ultra** (instead of Azure DALL-E-3)

## Required Environment Variables

Add these to your `.env` file:

```bash
# Replicate API for Google Imagen-4
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Stability AI for image generation  
STABLE_API_KEY=your_stability_ai_api_key_here
```

## API Endpoints

### Google Imagen-4 (via Replicate)
- **Endpoint**: `https://api.replicate.com/v1/models/google/imagen-4/predictions`
- **Method**: POST
- **Authentication**: Bearer token via `REPLICATE_API_TOKEN`
- **Features**: High-quality image generation with Google's latest model
- **Output**: WebP format, 1:1 aspect ratio

### Stability AI Ultra
- **Endpoint**: `https://api.stability.ai/v2beta/stable-image/generate/ultra`
- **Method**: POST  
- **Authentication**: Bearer token via `STABLE_API_KEY`
- **Features**: Ultra-high quality image generation
- **Output**: WebP format

## Usage

Users can generate images by:

1. Using the attachment menu in chat → "Generate Image"
2. Selecting either:
   - **Google Imagen-4 (Replicate)** - for Google's advanced image model
   - **Stability AI Ultra** - for ultra-high quality images
3. Entering their image prompt and generating

## Technical Implementation

- **Replicate**: Uses polling mechanism to wait for image generation completion
- **Stability AI**: Direct API call that returns image data immediately
- **Output**: Both services return WebP format images for optimal quality and file size
- **Error Handling**: Comprehensive error messages for common issues (quota exceeded, authentication, etc.)

## Benefits

1. **Better Reliability**: Direct API access instead of proxied services
2. **Higher Quality**: Latest image generation models
3. **Better Performance**: Optimized endpoints and formats
4. **Cost Effective**: Pay-per-use pricing models

## Testing

To test the image generation:

1. Ensure API keys are set in your `.env` file
2. Start the application: `pnpm dev`
3. Open a chat and try generating an image
4. Check the console logs for detailed debugging information