export {};

declare global {
  interface Window {
    electron: {
      login: () => Promise<{ success: boolean; token?: string; error?: string }>;
      loginGoogle: () => Promise<{ success: boolean; token?: string; error?: string }>;
    };

    runner: {
      up(projectName: string): Promise<void>;
      exec(command: string): Promise<import("@bros/runner").ExecResult>;
      down(): Promise<void>;
    };
  }
}
