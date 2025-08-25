"use client";
import { Box, Typography } from "@mui/material";
import BasicBreadcrumbs from "../../components/breadcrumbd";
import Edit_user from "../../components/edit_user";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../components/Authcontext";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";

export default function EditUserPage() {
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
          <Typography variant="h5" sx={{ marginTop: 1 }}>
            Gestione Utenti
          </Typography>
          <Typography variant="body2" sx={{ marginTop: 1 }}>
            Qui puoi modificare l'utente
          </Typography>
        </Box>
        <Box sx={{ padding: 2, height: "74vh" }}>
          <Edit_user />
        </Box>
      </Box>
    );
  }
}
