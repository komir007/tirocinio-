import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#483D8B', // Dark Slate Blue, per la coerenza con la sfumatura
    },
    secondary: {
      main: '#B3B9E1', // Blu/viola più chiaro per azioni secondarie
    },
    background: {
      default: '#1A1A2E', // Sfondo scuro per il corpo
      paper: '#FFFFFF', // Bianco per le card/paper
    },
    text: {
      primary: '#333333', // Testo scuro predefinito sulle card chiare
      secondary: '#555555', // Testo secondario sulle card chiare
      disabled: '#AAAAAA',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h4: { color: '#333333' },
    h5: { color: '#333333' },
    h6: { color: '#333333' },
    body1: { color: '#555555' },
    body2: { color: '#555555' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C2C4E', // Un viola scuro leggermente più chiaro per la barra dell'app
          borderRadius: '0 0 12px 12px', // Angoli arrotondati inferiori
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)', // Ombra più marcata per la barra
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', // Ombra più forte per i pulsanti
          '&.MuiButton-containedPrimary': {
            // Applica la sfumatura direttamente per i pulsanti primari "contained"
            background: 'linear-gradient(to right, #6A5ACD, #483D8B)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(to right, #7B68EE, #5A4F9F)', // Leggermente più chiaro al passaggio del mouse
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
            },
          },
          '&.MuiButton-outlinedSecondary': {
            borderColor: '#B3B9E1', // Colore del bordo per il secondario "outlined"
            color: '#483D8B', // Colore del testo per il secondario "outlined"
            '&:hover': {
              backgroundColor: 'rgba(179, 185, 225, 0.1)', // Effetto hover leggero
              borderColor: '#9FA8DA',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Angoli leggermente più arrotondati per le card
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)', // Ombra più prominente per le card
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
