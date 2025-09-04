"use client";
import { Box, Typography, Button, TextField, Divider } from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import { useContext } from "react";
import { AuthContext } from "../components/Authcontext";
import { useRouter } from "next/navigation";
import React from "react";
import { ParentComponent } from "./comp/custom_util";

export default function testpage() {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  const handleMap = (sections: any[]) => {
    
  };

  return (
    <ParentComponent onMap={(tree) => console.log("mappa:", tree)}>
      <Box id="form_test" key="form_test" component="form" m={2}>
        <Box
          id="sezioni_anagrafe"
          key="sezioni_anagrafe"
          m={2}
          mt={4}
          mb={4}
          p={2}
          border={1}
          borderColor="grey.300"
          borderRadius={2}
        >
          <Typography id="title_anagrafe">anagrafe</Typography>
          <TextField id="firstName" name="firstName" label="Nome" />
          <TextField id="lastName" name="lastName" label="Cognome" />
          <Divider />
        </Box>

        <Box
          id="sezioni_indirizzo"
          key="sezioni_indirizzo"
          m={2}
          mt={4}
          mb={4}
          p={2}
          border={1}
          borderColor="grey.300"
          borderRadius={2}
        >
          <Typography id="title_indirizzo">indirizzo</Typography>
          <TextField id="address" name="address" label="Indirizzo" />
          <TextField id="city" name="city" label="Città" />
          <TextField id="zip" name="zip" label="CAP" />
          <TextField id="country" name="country" label="Nazione" />
          <Divider />
        </Box>

        <Button
          id="submit_button"
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2, ml: 5, borderRadius: 2 }}
          onClick={(e) => {
            e.preventDefault();
            handleMap([]);
          }}
        >
          invia
        </Button>
      </Box>
    </ParentComponent>
  );
}
