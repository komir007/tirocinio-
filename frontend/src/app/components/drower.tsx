"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "./Authcontext";
import {
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  Collapse,
} from "@mui/material";

const drawerWidth = 280;
const collapsedWidth = 72;
const appBarHeight = 92;

interface Props {
  window?: () => Window;
  children?: React.ReactNode;
}

export default function ResponsiveDrawer(props: Props) {
  const { children } = props;
  const [collapsed, setCollapsed] = React.useState(false);
  const authContext = React.useContext(AuthContext);
  const user = authContext?.user;
  const logout = authContext?.logout;
  const pathname = usePathname();
  const router = useRouter();

  // --- NEW: detect xs with MUI and auto-collapse when entering xs
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm")); // true for xs
  React.useEffect(() => {
    // quando entriamo in xs, mettiamo il drawer in modalità collapsed automaticamente
    if (isXs) setCollapsed(true);
    // non forziamo l'espansione quando si esce da xs: l'utente mantiene il controllo
  }, [isXs]);
  // --- END NEW

  if ((pathname && pathname.startsWith("/login")) || !user) {
    // Non renderizzare AppBar/Drawer sulla pagina di login
    return <>{children}</>;
  }

  const rawMenuItems = [
    {
      label: "HOME",
      icon: <HomeRoundedIcon />,
      path: "/",
      paths: ["/", "/home"],
    },
    {
      label: "UTENTI",
      icon: <PeopleAltRoundedIcon />,
      path: "/user",
      paths: ["/user", "/user/registration", "/user/edit_user"],
    },
  ];

  const isClient = String(user?.role ?? "").toLowerCase() === "client";

  // filtra le voci in base al ruolo e risolve il path attivo
  const menuItems = rawMenuItems
    .filter((item) => {
      // nasconde la voce "UTENTI" per i client
      if (isClient && item.label === "UTENTI") return false;
      return true;
    })
    .map((item) => ({
      ...item,
      path: pathname && item.paths.includes(pathname) ? pathname : item.path,
    }));

  const toggleCollapse = () => {
    setCollapsed((c) => !c);
  };

  const currentWidth = collapsed ? collapsedWidth : drawerWidth;

  const drawer = (
    <Box
      sx={{
        width: currentWidth,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        py={4}
        display="flex"
        alignItems="center"
        justifyContent={collapsed ? "center" : "space-between"}
      >
        <Typography
          variant="h5"
          pl={2}
          noWrap
          component="div"
          sx={{ display: collapsed ? "none" : "block", color: "#fff" }}
        >
          LOGO
        </Typography>
        <IconButton
          onClick={toggleCollapse}
          size="small"
          sx={{
            ml: collapsed ? 0 : 1,
            
            // transform: collapsed ? "rotate(180deg)" : "none",
            color: "#fff",
            bgcolor: "transparent",
            "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
            display: { xs: "block", sm: "inline-flex" }, // rimane visibile su sm+
          }}
          aria-label={collapsed ? "Apri drawer" : "Comprimi drawer"}
        >
          {collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
        </IconButton>
      </Box>
      <Box
        py={"17.5px"}
        px={"12px"}
        sx={{
          display: collapsed ? "flex" : "none",
          alignItems: "center",
          direction: "row",
          //justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "default",
            width: 45,
            height: 45,
          }}
        >
          {user?.name.charAt(0)}
        </Avatar>
      </Box>
      <Box
        p={2}
        sx={{
          display: collapsed ? "none" : "flex",
          alignItems: "center",
          direction: "row",
          //justifyContent: collapsed ? "center" : "flex-start",
          backgroundColor: "#84bdc98a",
          borderRadius: 3,
          mx: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "default",
            width: 45,
            height: 45,
          }}
        >
          {user?.name.charAt(0)}
        </Avatar>
        <Box
          sx={{
            display: collapsed ? "none" : "flex",
            alignItems: "left",
            flexDirection: "column",
            paddingLeft: 1,
          }}
        >
          <Typography padding={0} variant="subtitle1" sx={{ color: "#fff" }}>
            {user?.name}
          </Typography>
          <Typography
            color="gray500"
            padding={0}
            variant="body2"
            sx={{ color: "#fff" }}
          >
            {user?.role}
          </Typography>
        </Box>
      </Box>
      <Box height={30}></Box>

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() => router.push(item.path)}
              sx={{
                margin: 0.5,
                minHeight: 48,
                justifyContent: collapsed ? "center" : "flex-start",
                px: 2.5,
                borderRadius: 2,
                backgroundColor:
                  pathname === item.path ? "#c6e5deb4" : "transparent",
                "&:hover": { backgroundColor: "#c6e5de28" },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: "center",
                  color: pathname === item.path ? "#F37535" : "#518997",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: pathname === item.path ? "bold" : "normal",
                }}
                sx={{
                  opacity: collapsed ? 0 : 1,
                  display: collapsed ? "none" : "block",
                  color: pathname === item.path ? "#09404B" : "#518997",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        elevation={1}
        position="fixed"
        sx={(theme) => ({
          height: `${appBarHeight}px`,
          // AppBar si adatta sempre alla larghezza del drawer corrente
          width: `calc(100% - ${currentWidth}px)`,
          ml: `${currentWidth}px`,
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: "#ffffffff",
          
        })}
      >
        <Toolbar
          sx={{
            minHeight: `${appBarHeight}px !important`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
           
          }}
        >
          <Box display="flex" alignItems="center">
            {/* Menu icon: su xs toggle la collapse (ora non usiamo più drawer mobile) */}
            <Typography
              sx={{ display: collapsed ? "block" : "none", color: "#000"}}
              variant="h6"
            >
              LOGO
            </Typography>
          </Box>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <IconButton
              sx={{ color: "red" }}
              onClick={() => {
                logout?.();
                router.push("/login");
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: currentWidth, flexShrink: 0 }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="permanent"
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: currentWidth,
              backgroundColor: "primary.main",
              transition: (theme) =>
                theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.shortest,
                }),
              overflowX: "hidden",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "grey.100",
          height: "calc(100vh - 92px)",
          width: `calc(100% - ${currentWidth}px)`,
          mt: `${appBarHeight}px`,
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.shortest,
            }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
