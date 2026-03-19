import { NativeModule, requireNativeModule } from 'expo';

import { ExpoNetlensModuleEvents } from './ExpoNetlens.types';

declare class ExpoNetlensModule extends NativeModule<ExpoNetlensModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoNetlensModule>('ExpoNetlens');
