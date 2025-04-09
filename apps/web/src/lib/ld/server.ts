import type {
  LDClient,
  LDContext,
  LDFlagValue,
} from "@launchdarkly/node-server-sdk";
import { init } from "@launchdarkly/node-server-sdk";

let launchDarklyClient: LDClient | null = null;

async function initLaunchDarkly() {
  const client = init(process.env.LAUNCHDARKLY_API_KEY as string, {
    logger: {
      error: (...args) => console.info(...args),
      warn: (...args) => console.info(...args),
      info: (...args) => console.info(...args),
      debug: (...args) => console.info(...args),
    },
  });
  await client.waitForInitialization({ timeout: 10 });
  return client;
}

export async function getClient() {
  if (!launchDarklyClient && process.env.LAUNCHDARKLY_API_KEY) {
    launchDarklyClient = await initLaunchDarkly();
  }
  return launchDarklyClient;
}

export async function getVariation(
  flagKey: string,
  context: LDContext,
  defaultValue: LDFlagValue,
) {
  const client = await getClient();
  if (!client) {
    return defaultValue;
  }
  return client.variation(flagKey, context, defaultValue);
}
