"use client";
import { Box, Typography, Button, Chip } from "@mui/material";
import {
  Settings as SettingsIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import BasicBreadcrumbs from "../../components/breadcrumbd";
import Registration from "../../components/registration";
import CustomizationBanner from "../../components/CustomizationBanner";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../components/Authcontext";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";

export default function RegistrationPage() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      if (!user) {
        router.replace("/login");
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [user, router]);

  // mentre aspettiamo l'inizializzazione mostra un loader (o null per niente)
  if (!user) {
    return (
      <Box
        sx={{
          height: "calc(100vh - 92px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  } else {
    return (
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        bgcolor="grey.100"
      >
        <Box sx={{ marginTop: 4, marginBottom: 1, marginX: 3 }}>
          <BasicBreadcrumbs />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ marginTop: 1 }}
          >
            <Box>
              <Typography variant="h5">Registrazione Utente</Typography>
              <Typography variant="body2" sx={{ marginTop: 1 }}>
                Qui puoi registrare un nuovo utente
              </Typography>
            </Box>
            
          </Box>
        </Box>


        <Box sx={{ padding: 2, height: "74vh" }}>
          <Registration />
        </Box>
      </Box>
    );
  }
}
