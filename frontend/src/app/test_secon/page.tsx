'use client';
import React from 'react';
import { Button, Chip, TextField } from '@mui/material';
import { useChildrenMapper } from './comp/useChildrenMapper';
import { ChildrenInspector } from './comp/ChildrenInspector';

export default function Demo() {
  return (
    <MagicWrapper>
      <Button key="primo">Primo</Button>
      <Chip key="secondo" label="Secondo" />
      <TextField key="terzo" label="Terzo" size="small" />
      <Button key="quarto" variant="outlined">Quarto</Button>
      <input key="quinto" id="quinto" type="text" />
    </MagicWrapper>
  );
}

function MagicWrapper({ children }: { children: React.ReactNode }) {
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