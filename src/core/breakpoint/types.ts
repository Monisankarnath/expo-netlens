import { MockMatching } from '../mock/types';

export interface BreakpointRule {
  id: string;
  name: string;
  enabled: boolean;
  matching: MockMatching;
  pauseOn: 'request' | 'response' | 'both';
  createdAt: number;
}
