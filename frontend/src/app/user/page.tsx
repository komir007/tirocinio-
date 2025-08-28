"use client";
import { Box, Typography, Button, Chip } from "@mui/material";
import { Settings as SettingsIcon, TableChart as TableIcon } from "@mui/icons-material";
import UserTable from "../components/userstable";
import BasicBreadcrumbs from "../components/breadcrumbd";
import CustomizationBanner from "../components/CustomizationBanner";
import { useContext, useEffect } from "react";
import { AuthContext } from "../components/Authcontext";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";

export default function UsersPage() {
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
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ marginTop: 1 }}>
            <Box>
              <Typography variant="h5">
                Gestione Utenti
              </Typography>
              <Typography variant="body2" sx={{ marginTop: 1 }}>
                Qui puoi gestire gli utenti
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <Chip 
                icon={<TableIcon />}
                label="Modalità Standard" 
                color="default"
                variant="outlined"
              />
              <Button
                variant="contained"
                startIcon={<SettingsIcon />}
                onClick={() => router.push('/user/customizable')}
                size="large"
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                  }
                }}
              >
                Modalità Customizzabile
              </Button>
            </Box>
          </Box>
        </Box>
        
        {/* Banner informativo per la nuova funzionalità */}
        <Box sx={{ marginX: 3 }}>
          <CustomizationBanner 
            variant="table"
            onTryCustomization={() => router.push('/user/customizable')}
          />
        </Box>
        
        <Box sx={{ padding: 2, height: "74vh" }}>
          <UserTable />
        </Box>
      </Box>
    );
  }
}
