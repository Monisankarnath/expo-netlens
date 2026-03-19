import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoNetlensViewProps } from './ExpoNetlens.types';

const NativeView: React.ComponentType<ExpoNetlensViewProps> =
  requireNativeView('ExpoNetlens');

export default function ExpoNetlensView(props: ExpoNetlensViewProps) {
  return <NativeView {...props} />;
}
