'use client';
import React from 'react';
import { Box, Button, Chip, TextField } from '@mui/material';

import MagicWrapper from '@/app/test_secon/comp/MagicWrapper';




export default function Demo() {
  return (
    <MagicWrapper>
      <Box
        component="form"
        key="form"
        m={10}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        
        <Box
          key={"sezione_1"}
          m={10}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          gap={2}
        >
          <TextField key="field_1" label="Primo" />
          <TextField key="field_2" label="Secondo" />
        </Box>
      
        <Box
          key={"sezione_2"}
          m={10}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          gap={2}
        >
          <TextField key="field_3" variant="standard" label="Terzo"  />
          <TextField key="field_4" variant="outlined" label="Quarto" />
          <TextField key="field_5" variant="filled" label="Quinto" />
        </Box>
       
      </Box>
    </MagicWrapper>
  );
}


