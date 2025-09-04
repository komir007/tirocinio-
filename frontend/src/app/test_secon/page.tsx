'use client';
import React from 'react';
import { Button, Chip, TextField } from '@mui/material';
import { useChildrenMapper } from './comp/useChildrenMapper';
import { ChildrenInspector } from './comp/ChildrenInspector';
import MagicWrapper from './comp/MagicWrapper';

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


