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

// image asset modules
declare module "*.gif" {
  const value: string;
  export default value;
}
declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.jpg" {
  const value: string;
  export default value;
}
declare module "*.jpeg" {
  const value: string;
  export default value;
}
declare module "*.svg" {
  const value: string;
  export default value;
}
