'use client';

import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';

interface AuthorLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function AuthorLink({ href, children, className = 'author-link' }: AuthorLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      router.push(href);
    }
  };

  return (
    <span
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </span>
  );
}
