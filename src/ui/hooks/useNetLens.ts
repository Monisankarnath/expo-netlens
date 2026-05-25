import { useContext } from 'react';
import { NetLensContext } from '../NetLensContext';

export function useNetLens() {
  const context = useContext(NetLensContext);
  if (!context) {
    throw new Error('useNetLens must be used within a <NetLensProvider>');
  }
  return context;
}
