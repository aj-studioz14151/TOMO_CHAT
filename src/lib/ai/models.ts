import "server-only";

import { createOllama } from "ollama-ai-provider-v2";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";
import { LanguageModel } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { cohere } from "@ai-sdk/cohere";
import { xai } from "@ai-sdk/xai";
import {
  createOpenAICompatibleModels,
  openaiCompatibleModelsSafeParse,
} from "./create-openai-compatiable";
import { ChatModel } from "app-types/chat";
import {
  DEFAULT_FILE_PART_MIME_TYPES,
  OPENAI_FILE_MIME_TYPES,
  GEMINI_FILE_MIME_TYPES,
  ANTHROPIC_FILE_MIME_TYPES,
} from "./file-support";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createAzureOpenAICompatible } from "./azure-openai-compatible";

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/api",
});
const groq = createGroq({
  baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// Together AI - Free tier with generous limits
const together = process.env.TOGETHER_API_KEY
  ? createOpenAICompatible({
      name: "together",
      apiKey: process.env.TOGETHER_API_KEY,
      baseURL: "https://api.together.xyz/v1",
    })
  : null;

// Azure-hosted models with Bearer token authentication

// DeepSeek configuration
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const deepseekBaseURL =
  process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";

const xaiApiKey = process.env.XAI_API_KEY;

// Azure OpenAI Chat Completions endpoint
const azureOpenAIChatApiKey =
  process.env.AZURE_OPENAI_CHAT_API_KEY || process.env.AZURE_API_KEY;
const azureOpenAIChatBaseURL =
  process.env.AZURE_OPENAI_CHAT_BASE_URL ||
  "https://kamesh6592-7068-resource.cognitiveservices.azure.com/openai/deployments/";

// Azure OpenAI Responses endpoint (for GPT-5-mini)
const azureOpenAIResponsesApiKey =
  process.env.AZURE_OPENAI_RESPONSES_API_KEY || process.env.AZURE_API_KEY;
const azureOpenAIResponsesBaseURL =
  process.env.AZURE_OPENAI_RESPONSES_BASE_URL ||
  "https://kamesh6592-7068-resource.cognitiveservices.azure.com/openai/deployments/";

// Create direct providers
const directDeepseek = deepseekApiKey
  ? createOpenAICompatible({
      name: "deepseek",
      apiKey: deepseekApiKey,
      baseURL: deepseekBaseURL,
    })
  : null;

const directXai = xaiApiKey ? xai : null;

// Azure OpenAI provider factory
const azureOpenAIProvider = azureOpenAIChatApiKey
  ? createAzureOpenAICompatible({
      name: "azure-openai",
      apiKey: azureOpenAIChatApiKey,
      baseURL: azureOpenAIChatBaseURL,
    })
  : null;

// Azure OpenAI Responses provider factory (for GPT-5-mini)
const azureOpenAIResponsesProvider = azureOpenAIResponsesApiKey
  ? createAzureOpenAICompatible({
      name: "azure-openai-responses",
      apiKey: azureOpenAIResponsesApiKey,
      baseURL: azureOpenAIResponsesBaseURL,
    })
  : null;

const staticModels = {
  openai: {
    "gpt-4o-mini": azureOpenAIProvider
      ? azureOpenAIProvider("gpt-4o-mini", "2025-01-01-preview")
      : openai("gpt-4o-mini"),
    "gpt-5-mini": azureOpenAIResponsesProvider
      ? azureOpenAIResponsesProvider("gpt-5-mini", "2025-04-01-preview")
      : openai("gpt-5-mini"),
  },
  google: {
    "gemini-2.5-flash-lite": google("gemini-2.5-flash-lite"),
    "gemini-2.5-flash": google("gemini-2.5-flash"),
    "gemini-2.5-pro": google("gemini-2.5-pro"),
  },
  anthropic: {
    "sonnet-4.5": anthropic("claude-sonnet-4-5"),
    "haiku-4.5": anthropic("claude-haiku-4-5"),
    "opus-4.1": anthropic("claude-opus-4-1"),
  },
  xai: directXai
    ? {
        "grok-4-1-fast-non-reasoning": directXai("grok-4-1-fast-non-reasoning"),
        "grok-4-fast-reasoning": directXai("grok-4-fast-reasoning"),
        "grok-4-fast-non-reasoning": directXai("grok-4-fast-non-reasoning"),
        "grok-3-mini": directXai("grok-3-mini"),
      }
    : {},
  deepseek: directDeepseek
    ? {
        "DeepSeek-V3.1": directDeepseek("deepseek-chat"),
      }
    : {},
  ollama: {
    "gemma3:1b": ollama("gemma3:1b"),
    "gemma3:4b": ollama("gemma3:4b"),
    "gemma3:12b": ollama("gemma3:12b"),
  },
  groq: {
    "kimi-k2-instruct": groq("moonshotai/kimi-k2-instruct"),
    "llama-4-scout-17b": groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    "gpt-oss-20b": groq("openai/gpt-oss-20b"),
    "gpt-oss-120b": groq("openai/gpt-oss-120b"),
    "qwen3-32b": groq("qwen/qwen3-32b"),
  },
  together: together
    ? {
        "llama-3.1-8b": together("meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"),
        "llama-3.1-70b": together(
          "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        ),
        "llama-3.1-405b": together(
          "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
        ),
        "qwen2.5-72b": together("Qwen/Qwen2.5-72B-Instruct-Turbo"),
        "mistral-7b": together("mistralai/Mistral-7B-Instruct-v0.3"),
        "deepseek-r1-671b": together("deepseek-ai/DeepSeek-R1"),
      }
    : {},
  mistral: process.env.MISTRAL_API_KEY
    ? {
        "mistral-large": mistral("mistral-large-latest"),
        "mistral-small": mistral("mistral-small-latest"),
        codestral: mistral("codestral-latest"),
        "pixtral-12b": mistral("pixtral-12b-2409"),
      }
    : {},
  cohere: process.env.COHERE_API_KEY
    ? {
        "command-a-03-2025": cohere("command-a-03-2025"),
        "command-r-plus": cohere("command-r-plus-08-2024"),
        "command-r": cohere("command-r-08-2024"),
        "command-r7b": cohere("command-r7b-12-2024"),
      }
    : {},
};

const staticUnsupportedModels = new Set([
  staticModels.ollama["gemma3:1b"],
  staticModels.ollama["gemma3:4b"],
  staticModels.ollama["gemma3:12b"],
  // Together AI reasoning models
  ...(staticModels.together?.["deepseek-r1-671b"]
    ? [staticModels.together["deepseek-r1-671b"]]
    : []),
]);

const staticSupportImageInputModels = {
  ...staticModels.google,
  ...staticModels.xai,
  ...staticModels.openai,
  ...staticModels.anthropic,
};

const staticFilePartSupportByModel = new Map<
  LanguageModel,
  readonly string[]
>();

const registerFileSupport = (
  model: LanguageModel | undefined,
  mimeTypes: readonly string[] = DEFAULT_FILE_PART_MIME_TYPES,
) => {
  if (!model) return;
  staticFilePartSupportByModel.set(model, Array.from(mimeTypes));
};

registerFileSupport(staticModels.openai["gpt-4o-mini"], OPENAI_FILE_MIME_TYPES);
registerFileSupport(staticModels.openai["gpt-5-mini"], OPENAI_FILE_MIME_TYPES);

registerFileSupport(
  staticModels.google["gemini-2.5-flash-lite"],
  GEMINI_FILE_MIME_TYPES,
);
registerFileSupport(
  staticModels.google["gemini-2.5-flash"],
  GEMINI_FILE_MIME_TYPES,
);
registerFileSupport(
  staticModels.google["gemini-2.5-pro"],
  GEMINI_FILE_MIME_TYPES,
);

registerFileSupport(
  staticModels.anthropic["sonnet-4.5"],
  ANTHROPIC_FILE_MIME_TYPES,
);
registerFileSupport(
  staticModels.anthropic["opus-4.1"],
  ANTHROPIC_FILE_MIME_TYPES,
);

registerFileSupport(
  staticModels.xai["grok-4-fast-non-reasoning"],
  DEFAULT_FILE_PART_MIME_TYPES,
);
registerFileSupport(staticModels.xai["grok-3"], DEFAULT_FILE_PART_MIME_TYPES);
registerFileSupport(
  staticModels.xai["grok-3-mini"],
  DEFAULT_FILE_PART_MIME_TYPES,
);
registerFileSupport(
  staticModels.deepseek["DeepSeek-V3.1"],
  DEFAULT_FILE_PART_MIME_TYPES,
);

const openaiCompatibleProviders = openaiCompatibleModelsSafeParse(
  process.env.OPENAI_COMPATIBLE_DATA,
);

const {
  providers: openaiCompatibleModels,
  unsupportedModels: openaiCompatibleUnsupportedModels,
} = createOpenAICompatibleModels(openaiCompatibleProviders);

const allModels = { ...openaiCompatibleModels, ...staticModels };

const allUnsupportedModels = new Set([
  ...openaiCompatibleUnsupportedModels,
  ...staticUnsupportedModels,
]);

export const isToolCallUnsupportedModel = (model: LanguageModel) => {
  return allUnsupportedModels.has(model);
};

const isImageInputUnsupportedModel = (model: LanguageModel) => {
  return !Object.values(staticSupportImageInputModels).includes(model);
};

export const getFilePartSupportedMimeTypes = (model: LanguageModel) => {
  return staticFilePartSupportByModel.get(model) ?? [];
};

const fallbackModel = staticModels.google["gemini-2.5-flash"];

export const customModelProvider = {
  modelsInfo: Object.entries(allModels).map(([provider, models]) => ({
    provider,
    models: Object.entries(models).map(([name, model]) => ({
      name,
      isToolCallUnsupported: isToolCallUnsupportedModel(model),
      isImageInputUnsupported: isImageInputUnsupportedModel(model),
      supportedFileMimeTypes: [...getFilePartSupportedMimeTypes(model)],
    })),
    hasAPIKey: checkProviderAPIKey(provider as keyof typeof staticModels),
  })),
  getModel: (model?: ChatModel): LanguageModel => {
    if (!model) return fallbackModel;
    return allModels[model.provider]?.[model.model] || fallbackModel;
  },
};

function checkProviderAPIKey(provider: keyof typeof staticModels) {
  let key: string | undefined;
  switch (provider) {
    case "openai":
      key = process.env.OPENAI_API_KEY;
      break;
    case "google":
      key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      break;
    case "anthropic":
      key = process.env.ANTHROPIC_API_KEY;
      break;
    case "xai":
      key = process.env.XAI_API_KEY;
      break;
    case "deepseek":
      key = process.env.DEEPSEEK_API_KEY;
      break;
    case "groq":
      key = process.env.GROQ_API_KEY;
      break;
    case "together":
      key = process.env.TOGETHER_API_KEY;
      break;
    case "mistral":
      key = process.env.MISTRAL_API_KEY;
      break;
    case "cohere":
      key = process.env.COHERE_API_KEY;
      break;
    default:
      return true; // assume the provider has an API key
  }
  return !!key && key != "****";
}
