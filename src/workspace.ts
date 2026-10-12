import type { Workspace } from "@cloudflare/computer";
import { createPiTools } from "@cloudflare/computer/tools/pi-ai";
import type { ToolRegistration } from "@earendil-works/pi-durable";

/** Whole-file writes and deletes can safely run again after an eviction. */
const REPLAY_SAFE = new Set(["read", "ls", "find", "grep", "write", "delete"]);

/**
 * Adapt workspace file tools to pi-durable registrations.
 * Omitting shell prevents createPiTools from registering exec.
 */
export function createWorkspaceTools(workspace: Workspace): ToolRegistration[] {
  const { tools, execute } = createPiTools({ workspace });

  return tools.map((tool): ToolRegistration => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
    ...(tool.constrainedSampling
      ? { constrainedSampling: tool.constrainedSampling }
      : {}),
    // Repeating an exact-match edit can fail after it already changed the file.
    replay: REPLAY_SAFE.has(tool.name) ? "safe" : "unsafe",
    async execute(args, api, context) {
      const { content, isError } = await execute(
        { id: api.callId, name: tool.name, arguments: args },
        { abortSignal: context.abortSignal }
      );
      return { content, isError };
    }
  }));
}
