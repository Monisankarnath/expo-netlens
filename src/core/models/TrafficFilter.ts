import { HTTPMethod } from './HTTPMethod';
import { StatusCategory } from './StatusCategory';
import { ContentType } from './ContentType';

export interface TrafficFilter {
  searchText?: string;
  methods?: HTTPMethod[];
  statusCategories?: StatusCategory[];
  hosts?: string[];
  contentTypes?: ContentType[];
  onlyErrors?: boolean;
  onlyMocked?: boolean;
}

export type ExportFormat = 'curl' | 'har' | 'json';
