import { requireNativeModule } from 'expo-modules-core';

interface IExpoNetlensModule {
  isRunning(): boolean;
  getRecordCount(): number;
  startNativeInterception(): Promise<void>;
  stopNativeInterception(): Promise<void>;
}

// The native module will be fully implemented in Phase 2-3.
// For Phase 1, we only need the module to exist for the build to work.
let ExpoNetlensModule: IExpoNetlensModule | null = null;

try {
  ExpoNetlensModule = requireNativeModule<IExpoNetlensModule>('ExpoNetlens');
} catch {
  // Native module not available (e.g., web, or not linked)
}

export default ExpoNetlensModule;
