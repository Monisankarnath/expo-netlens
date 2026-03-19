import { registerWebModule, NativeModule } from 'expo';

import { ExpoNetlensModuleEvents } from './ExpoNetlens.types';

class ExpoNetlensModule extends NativeModule<ExpoNetlensModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoNetlensModule, 'ExpoNetlensModule');
