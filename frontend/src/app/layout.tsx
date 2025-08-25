"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./components/Authcontext";
import ResponsiveDrawer from "./components/drower";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            {/* Ora il drawer gestisce il main e i margini dinamici */}
            <ResponsiveDrawer>{children}</ResponsiveDrawer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}