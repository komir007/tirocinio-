'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

const LABELS: Record<string, string> = {
  'user': 'Users',
  'users': 'Users',
  // aggiungi altre mappature qui se vuoi
};

function prettify(segment: string) {
  const s = decodeURIComponent(segment).replace(/[-_]/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function BasicBreadcrumbs() {
  const pathname = usePathname() || '/';

  // Normalizza e crea i segmenti
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = [
    { href: '/', label: 'Home' },
    ...segments.map((segment, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/');
      const label = LABELS[segment.toLowerCase()] ?? prettify(segment);
      return { href, label };
    }),
  ];

  return (
    <nav aria-label="breadcrumb">
      <Breadcrumbs aria-label="breadcrumb" separator="•">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return isLast ? (
            <Typography key={crumb.href} color="text.primary">
              {crumb.label}
            </Typography>
          ) : (
            <Link
              key={crumb.href}
              component={NextLink}
              underline="hover"
              color="inherit"
              href={crumb.href}
            >
              {crumb.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </nav>
  );
}