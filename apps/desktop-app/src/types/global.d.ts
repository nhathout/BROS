import type { ExecResult } from "@bros/runner";

declare global {
  interface Window {
    runner: {
      up(projectName: string): Promise<void>;
      exec(command: string): Promise<ExecResult>;
      down(): Promise<void>;
    };
  }
}

export {};
