export default {
  isRunning(): boolean {
    return false;
  },
  getRecordCount(): number {
    return 0;
  },
  async startNativeInterception(): Promise<void> {
    // No-op on web — native interception is not available
  },
  async stopNativeInterception(): Promise<void> {
    // No-op on web
  },
};
