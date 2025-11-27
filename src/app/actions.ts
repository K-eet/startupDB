'use server';

import {
  intelligentStartupSearch,
  type IntelligentStartupSearchOutput,
} from '@/ai/flows/intelligent-startup-search';
import {
  intelligentVCSearch,
  type IntelligentVCSearchOutput,
} from '@/ai/flows/intelligent-vc-search';
import { initialStartups, initialVCFirms } from '@/lib/initial-data';

export interface SearchState {
  startups: IntelligentStartupSearchOutput;
  vcs: IntelligentVCSearchOutput;
  error: string | null;
  timestamp: number;
}

export async function searchAction(
  prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const keywords = formData.get('keywords') as string;
  const type = formData.get('type') as 'startups' | 'vcs';

  if (!keywords) {
    return {
      ...prevState,
      startups: initialStartups,
      vcs: initialVCFirms,
      error: null,
      timestamp: Date.now(),
    };
  }

  try {
    if (type === 'startups') {
      const startupResults = await intelligentStartupSearch({ keywords });
      return {
        startups: startupResults,
        vcs: [],
        error: null,
        timestamp: Date.now(),
      };
    } else if (type === 'vcs') {
      const vcResults = await intelligentVCSearch({ keywords });
      return {
        startups: [],
        vcs: vcResults,
        error: null,
        timestamp: Date.now(),
      };
    }
  } catch (e: any) {
    return {
      ...prevState,
      error: e.message || 'An unexpected error occurred.',
      timestamp: Date.now(),
    };
  }

  return {
    ...prevState,
    error: 'Invalid search type.',
    timestamp: Date.now(),
  };
}
