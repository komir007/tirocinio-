'use client';
import React from 'react';
import { Button, Chip, TextField } from '@mui/material';
import { useChildrenMapper } from './useChildrenMapper';
import { ChildrenInspector } from './ChildrenInspector';

export default function MagicWrapper({ children }: { children: React.ReactNode }) {
  const { mappedChildren, modifyChild } = useChildrenMapper(children);
  
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {mappedChildren}
      </div>

      <ChildrenInspector children={children} />

      <div style={{ marginTop: 16, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <button onClick={() => modifyChild(0, { hide: true })}>Nascondi #0</button>
        <button onClick={() => modifyChild(1, { disable: true })}>Disabilita #1</button>
        <button onClick={() => modifyChild(2, { addProps: { error: true } })}>Errore #2</button>
        <button onClick={() => modifyChild(3, { newOrder: 0 })}>Sposta #3 primo</button>
      </div>
    </div>
  );

}