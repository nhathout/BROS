export {};

declare global {
  interface Window {
    electron: {
      login: () => Promise<{ success: boolean; error?: string }>;
    };
  }
}
