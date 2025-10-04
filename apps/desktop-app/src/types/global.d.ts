import type { ExecResult } from "@bros/runner";
import type { IR } from "@bros/shared";
import type { ValidationResult } from "@bros/validation";
import type { BlockGraph } from "@bros/ui";

declare global {
  interface Window {
    runner: {
      up(projectName: string): Promise<void>;
      exec(command: string): Promise<ExecResult>;
      down(): Promise<void>;
    };
    ir: {
      build(graph: BlockGraph): Promise<{ ir: IR; issues: string[] }>;
      validate(ir: IR): Promise<ValidationResult>;
    };
  }
}

export {};
