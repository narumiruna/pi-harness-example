import type { Workspace } from "@cloudflare/computer";
import { describe, expect, it } from "vitest";
import { createWorkspaceTools } from "../workspace";

describe("free-plan workspace tools", () => {
  it("registers only file tools without needing an execution backend", () => {
    // Declaration creation does not access storage; executors are not called.
    const tools = createWorkspaceTools({} as Workspace);
    expect(tools.map((tool) => tool.name)).toEqual([
      "read", "ls", "find", "grep", "write", "edit", "delete"
    ]);
    expect(tools.find((tool) => tool.name === "edit")?.replay).toBe("unsafe");
    expect(tools.filter((tool) => tool.name !== "edit").every(
      (tool) => tool.replay === "safe"
    )).toBe(true);
  });
});
