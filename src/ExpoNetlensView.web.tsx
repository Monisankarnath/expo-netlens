import * as React from 'react';

import { ExpoNetlensViewProps } from './ExpoNetlens.types';

export default function ExpoNetlensView(props: ExpoNetlensViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
