"use server";
import { xai } from "@ai-sdk/xai";

import { ModelMessage, experimental_generateImage } from "ai";
import logger from "logger";

type GenerateImageOptions = {
  messages?: ModelMessage[];
  prompt: string;
  abortSignal?: AbortSignal;
};

type GeneratedImage = {
  base64: string;
  mimeType?: string;
};

export type GeneratedImageResult = {
  images: GeneratedImage[];
};

export async function generateImageWithOpenAI(
  options: GenerateImageOptions,
): Promise<GeneratedImageResult> {
  // Stability AI endpoint
  const apiKey = process.env.STABLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "STABLE_API_KEY is not set. Please configure it in your .env file.",
    );
  }
  const endpoint =
    "https://api.stability.ai/v2beta/stable-image/generate/ultra";

  try {
    const formData = new FormData();
    formData.append("prompt", options.prompt);
    formData.append("output_format", "webp");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        accept: "image/*",
      },
      body: formData,
      signal: options.abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Stability AI API error: ${response.statusText} - ${errorText}`,
      );
    }

    // Response is the image binary data
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return {
      images: [
        {
          base64,
          mimeType: "image/webp",
        },
      ],
    };
  } catch (error) {
    logger.error("Stability AI image generation error:", error);
    throw error;
  }
}

export async function generateImageWithXAI(
  options: GenerateImageOptions,
): Promise<GeneratedImageResult> {
  return experimental_generateImage({
    model: xai.image("grok-2-image"),
    abortSignal: options.abortSignal,
    prompt: options.prompt,
  }).then((res) => {
    return {
      images: res.images.map((v) => ({
        base64: Buffer.from(v.uint8Array).toString("base64"),
        mimeType: v.mediaType,
      })),
    };
  });
}

export const generateImageWithNanoBanana = async (
  options: GenerateImageOptions,
): Promise<GeneratedImageResult> => {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  // Log API key info for debugging (only first/last chars for security)
  logger.info(
    `Using Replicate API key: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`,
  );

  const endpoint =
    "https://api.replicate.com/v1/models/google/imagen-4/predictions";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: {
          prompt: options.prompt,
          output_format: "webp",
          output_quality: 90,
          aspect_ratio: "1:1",
        },
      }),
      signal: options.abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Replicate API error: ${response.statusText} - ${errorText}`,
      );
    }

    const result = await response.json();
    const predictionId = result.id;

    // Poll for completion
    let pollResponse;
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts with 2s delay = 1 minute timeout

    do {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      const pollResult = await pollResponse.json();

      if (pollResult.status === "succeeded") {
        const imageUrl = pollResult.output?.[0] || pollResult.output;

        if (!imageUrl) {
          throw new Error("No image URL in Replicate response");
        }

        // Download the image
        const imageResponse = await fetch(imageUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        return {
          images: [
            {
              base64,
              mimeType: "image/webp",
            },
          ],
        };
      } else if (pollResult.status === "failed") {
        throw new Error(
          `Image generation failed: ${pollResult.error || "Unknown error"}`,
        );
      }

      attempts++;
    } while (attempts < maxAttempts);

    throw new Error("Image generation timed out");
  } catch (error) {
    logger.error("Replicate image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for quota exceeded errors
    if (
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorMessage.includes("Quota exceeded")
    ) {
      throw new Error(
        "I've reached the daily image generation limit for this service. Please try again later or contact support to upgrade your plan for unlimited access.",
      );
    }

    // Check for API key errors
    if (
      errorMessage.includes("API key") ||
      errorMessage.includes("authentication")
    ) {
      throw new Error(
        "There's an issue with the image generation service authentication. Please contact support.",
      );
    }

    // Check for invalid requests
    if (errorMessage.includes("INVALID_ARGUMENT")) {
      throw new Error(
        "The image request couldn't be processed. Please try rephrasing your image description.",
      );
    }

    // Generic error with helpful message
    throw new Error(
      "I encountered an issue while generating the image. Please try again or rephrase your request.",
    );
  }
};
export async function generateImageWithHuggingFace(
  options: GenerateImageOptions,
): Promise<GeneratedImageResult> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not set.");
  }

  const model = "black-forest-labs/FLUX.1-schnell";
  const endpoint = `https://api-inference.huggingface.co/models/${model}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: options.prompt }),
      signal: options.abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Hugging Face API error: ${response.status} - ${errorText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return {
      images: [
        {
          base64,
          mimeType: "image/webp",
        },
      ],
    };
  } catch (error) {
    logger.error("Hugging Face image generation error:", error);
    throw error;
  }
}

export async function generateImageWithPollinations(
  options: GenerateImageOptions,
): Promise<GeneratedImageResult> {
  const prompt = encodeURIComponent(options.prompt);
  const url = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

  try {
    const response = await fetch(url, {
      signal: options.abortSignal,
    });

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return {
      images: [
        {
          base64,
          mimeType: "image/jpeg",
        },
      ],
    };
  } catch (error) {
    logger.error("Pollinations image generation error:", error);
    throw error;
  }
}

/**
 * Unified image generation with fallback mechanism.
 * Tries providers in order, falling back to free ones if necessary.
 */
export async function generateImageWithFallback(
  options: GenerateImageOptions,
  preferredProvider?:
    | "openai"
    | "xai"
    | "google"
    | "huggingface"
    | "pollinations",
): Promise<GeneratedImageResult> {
  const providers = [
    {
      name: "openai",
      fn: generateImageWithOpenAI,
      envKey: "STABLE_API_KEY",
    },
    {
      name: "xai",
      fn: generateImageWithXAI,
      envKey: "XAI_API_KEY",
    },
    {
      name: "google",
      fn: generateImageWithNanoBanana,
      envKey: "REPLICATE_API_TOKEN",
    },
    {
      name: "huggingface",
      fn: generateImageWithHuggingFace,
      envKey: "HUGGINGFACE_API_KEY",
    },
    {
      name: "pollinations",
      fn: generateImageWithPollinations,
      envKey: null,
    },
  ];

  // Reorder providers to put preferred one first
  if (preferredProvider) {
    const index = providers.findIndex((p) => p.name === preferredProvider);
    if (index > -1) {
      const [preferred] = providers.splice(index, 1);
      providers.unshift(preferred);
    }
  }

  const errors: string[] = [];

  for (const provider of providers) {
    // Skip if API key is missing (unless it's a free provider like pollinations)
    if (provider.envKey && !process.env[provider.envKey]) {
      continue;
    }

    try {
      logger.info(`Attempting image generation with ${provider.name}...`);
      return await provider.fn(options);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.warn(`Image generation with ${provider.name} failed: ${msg}`);
      errors.push(`${provider.name}: ${msg}`);

      // If the error is an abort, don't fallback
      if (msg.includes("abort") || msg.includes("cancel")) {
        throw error;
      }
    }
  }

  throw new Error(
    `All image generation providers failed. Errors: ${errors.join("; ")}`,
  );
}
