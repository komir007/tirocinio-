"use client";
import React from "react";
import { Box, Button, Chip, TextField } from "@mui/material";
import { useChildrenMapper } from "./comp/useChildrenMapper";
import { ChildrenInspector } from "./comp/ChildrenInspector";
import MagicWrapper from "./comp/MagicWrapper";

export default function Demo() {
  return (
    <MagicWrapper>
      <Box key="from_demo" component="form">
        <Box key="sezione_1">
          <TextField key="primo_input" label="Primo Input" size="small" />
          <Button key="primo_bottone">Primo</Button>
        </Box>
        <Box key="sezione_2">
          <TextField key="terzo_input" label="Terzo" size="small" />
          <Button key="quarto_bottone" variant="outlined">
            Quarto
          </Button>
        </Box>
      </Box>
    </MagicWrapper>
  );
}
