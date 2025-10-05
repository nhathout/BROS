import type { ExecResult } from "@bros/runner";

export {};

declare global {
  interface Window {
    runner: {
      up(projectName: string): Promise<void>;
      exec(command: string): Promise<ExecResult>;
      down(): Promise<void>;
    };
    ir: {
      build(graph: any): Promise<{ ir: any; issues: string[] }>;
      validate(ir: any): Promise<{ errors: any[]; warnings: any[] }>;
    };
  }
}
