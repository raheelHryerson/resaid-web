import OpenAI from "openai";

type OpenAIConfig = {
  provider: "openai" | "azure-openai";
  apiKey: string;
  baseURL?: string;
  defaultQuery?: Record<string, string>;
  model: string; // For Azure, this is the deployment name
};

function getOpenAIConfig(): OpenAIConfig | null {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-06-01";

  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openaiModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (azureEndpoint && azureApiKey && azureDeployment) {
    return {
      provider: "azure-openai",
      apiKey: azureApiKey,
      baseURL: `${azureEndpoint}/openai`,
      defaultQuery: { "api-version": azureApiVersion },
      model: azureDeployment,
    };
  }

  if (openaiApiKey) {
    return {
      provider: "openai",
      apiKey: openaiApiKey,
      model: openaiModel,
    };
  }

  return null;
}

export function getAIClient() {
  const cfg = getOpenAIConfig();
  if (!cfg) {
    throw new Error(
      "AI provider not configured. Set OPENAI_API_KEY or Azure OpenAI envs."
    );
  }

  const client = new OpenAI({
    apiKey: cfg.apiKey,
    baseURL: cfg.baseURL,
    defaultQuery: cfg.defaultQuery,
  });

  return { client, model: cfg.model, provider: cfg.provider } as const;
}
