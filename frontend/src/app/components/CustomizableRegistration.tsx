"use client";
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "./Authcontext";
import { CompactCustomizableForm } from "./Customization/components/CompactCustomizableForm";
import { useAdminConfig } from "./Customization/hooks/useAdminConfig";

import { useCustomizationContext } from "./Customization/components/CustomizableProvider";
import { DEFAULT_FORM_CONFIGS } from "./Customization/config/defaulteFormConfigs";
import { 
  Box, 
  Typography, 
  Snackbar, 
  Alert
} from "@mui/material";

export default function CustomizableRegistration() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const by = authContext?.user?.email;
  const isAgent = authContext?.user?.role?.toLowerCase() === "agent";
  const isAdmin = authContext?.user?.role?.toLowerCase() === "admin";

  // Hook per recuperare la configurazione admin (solo per non-admin)
  const { 
    adminConfig, 
    loading: adminConfigLoading, 
    error: adminConfigError,
    createdBy: adminCreatedBy 
  } = useAdminConfig("user-registration");

  // Customization hooks
  const {
    config,
    loading: customizationLoading,
    updateFormCustomization,
  } = useCustomizationContext();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: Record<string, any>) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: isAgent ? "client" : formData.role, // forza client se agent
        createdBy: by || "",
      };

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
        }/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Errore nella registrazione utente");

      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
        router.push("/user");
      }, 1000);
    } catch (err) {
      alert("Errore durante la registrazione utente");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Prepara sezioni del form
  const formSections = DEFAULT_FORM_CONFIGS["user-registration"].sections.map(
    (section) => {
      // Se è un agent, nascondi la sezione permessi o rendi readonly il campo role
      if (isAgent && section.id === "permissions") {
        return {
          ...section,
          fields: section.fields.map((field: any) =>
            field.id === "role"
              ? { ...field, readOnly: true, hidden: false }
              : field
          ),
        };
      }
      return section;
    }
  );

  // Loading state - include admin config loading for non-admin users
  if (customizationLoading || (!isAdmin && adminConfigLoading)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <Typography>
          Caricamento configurazione...
          {!isAdmin && adminConfigLoading && " (Verificando restrizioni admin...)"}
        </Typography>
      </Box>
    );
  }

  // Log admin config error for debugging
  if (adminConfigError) {
    console.warn('⚠️ Admin config error:', adminConfigError);
  }

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      width="100%"
      maxHeight="74vh"
      overflow="auto"
      position="relative"
    >
      {/* Form customizzabile compatto */}
      <CompactCustomizableForm
        formId="user-registration"
        sections={formSections}
        customization={config?.forms?.["user-registration"] || undefined}
        onCustomizationChange={(formConfig) => updateFormCustomization("user-registration", formConfig)}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Registrazione..." : "Registra Utente"}
        loading={loading}
        initialValues={{
          role: isAgent ? "client" : "",
          createdBy: by || "",
        }}
        adminConfig={adminConfig || undefined}
        createdBy={adminCreatedBy || by}
        onInheritAdminLocks={(inheritedConfig) => {
          console.log('🔒 Admin locks inherited from API:', {
            inheritedConfig,
            originalAdminConfig: adminConfig,
            adminCreatedBy
          });
          // Qui potresti salvare la configurazione ereditata se necessario
        }}
      />

      

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Utente registrato con successo!
        </Alert>
      </Snackbar>
    </Box>
  );
}
