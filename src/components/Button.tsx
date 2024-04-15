'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export function RedirectButton({
  buttonElement,
  path
}: {
  buttonElement: ReactNode;
  path: string;
}) {
  const router = useRouter();

  return <div onClick={() => router.push(path)}>{buttonElement}</div>;
}

export function ActionButton({
  click,
  title,
  className
}: {
  title: string;
  className: string | undefined;
  click: Function;
}) {
  return (
    <button className={className} onClick={() => click()}>
      {title}
    </button>
  );
}
