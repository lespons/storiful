'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

export const SWRProvider = ({
  children,
  fallback
}: {
  children: ReactNode;
  fallback: { [key: string]: unknown };
}) => {
  return <SWRConfig value={{ fallback }}>{children}</SWRConfig>;
};
