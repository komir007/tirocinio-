"use client";
import Image from "next/image";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "./components/Authcontext";
import { useRouter } from "next/navigation";
import BasicBreadcrumbs from "./components/breadcrumbd";
import AuthDebugPanel from "./components/AuthDebugPanel";

export default function Homepage() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      if (!user) {
        router.replace("/login");
      }
    }, 5000);
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
      // Nota: il Drawer/AppBar ora è gestito dal wrapper `ResponsiveDrawer` in layout.tsx
      <Box display="flex" flexDirection="column" height="100%">
        <Box sx={{ marginTop: 0 }}>
          <Box sx={{ marginTop: 4, marginBottom: 1, marginX: 3 }}>
            <BasicBreadcrumbs />
            <Typography variant="h5" sx={{ marginTop: 1 }}>
              Home
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              qui trovi la homepage :D
            </Typography>
            
            {/* Debug panel solo in development */}
            {process.env.NODE_ENV === 'development' && <AuthDebugPanel />}
          </Box>
        </Box>
      </Box>
    );
  }
}
