"use client";
import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "./Authcontext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Divider } from "@mui/material";

export default function Registration() {
  const authContext = useContext(AuthContext);
  const by = authContext?.user?.email;
  const isAgent = authContext?.user?.role?.toLowerCase() === "agent";

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: isAgent ? "client" : "",
    createdBy: by || "",
  });
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const router = useRouter();

  // Funzioni per manipolare il DOM tramite ID
  const hideField = (fieldId: string) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.style.display = 'none';
    }
  };

  const showField = (fieldId: string) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.style.display = '';
    }
  };

  const makeFieldReadOnly = (fieldId: string) => {
    const element = document.getElementById(fieldId);
    if (element) {
      const input = element.querySelector('input, select') as HTMLInputElement;
      if (input) {
        input.disabled = true;
        element.style.opacity = '0.6';
      }
    }
  };

  const makeFieldEditable = (fieldId: string) => {
    const element = document.getElementById(fieldId);
    if (element) {
      const input = element.querySelector('input, select') as HTMLInputElement;
      if (input) {
        input.disabled = false;
        element.style.opacity = '1';
      }
    }
  };

  const reorderField = (fieldId: string, order: number) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.style.order = order.toString();
    }
  };

  // Funzioni avanzate per acquisire e riordinare sezioni
  const getAllSections = () => {
    const sections = [
      { id: 'sezione_anagrafica', name: 'Informazioni anagrafiche' },
      { id: 'sezione_accesso', name: 'Accesso' },
      { id: 'sezione_ruolo', name: 'Ruolo' }
    ];
    return sections;
  };

  const getAllFields = () => {
    const fields = [
      { id: 'field-name', name: 'Nome', section: 'sezione_anagrafica' },
      { id: 'field-cognome', name: 'Cognome', section: 'sezione_anagrafica' },
      { id: 'field-email', name: 'Email', section: 'sezione_accesso' },
      { id: 'field-password', name: 'Password', section: 'sezione_accesso' },
      { id: 'field-role', name: 'Ruolo', section: 'sezione_ruolo' }
    ];
    return fields;
  };

  const reorderSections = (sectionOrder: string[]) => {
    const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement;
    if (formContainer) {
      // Applica order CSS alle sezioni
      sectionOrder.forEach((sectionId, index) => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.style.order = index.toString();
        }
      });
      // Assicurati che il container supporti flexbox
      formContainer.style.display = 'flex';
      formContainer.style.flexDirection = 'column';
    }
  };

  const hideSections = (sectionIds: string[]) => {
    sectionIds.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = 'none';
      }
    });
  };

  const showSections = (sectionIds: string[]) => {
    sectionIds.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = '';
      }
    });
  };

  const makeSectionReadOnly = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const inputs = section.querySelectorAll('input, select') as NodeListOf<HTMLInputElement>;
      inputs.forEach(input => {
        input.disabled = true;
      });
      section.style.opacity = '0.6';
    }
  };

  const makeSectionEditable = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const inputs = section.querySelectorAll('input, select') as NodeListOf<HTMLInputElement>;
      inputs.forEach(input => {
        input.disabled = false;
      });
      section.style.opacity = '1';
    }
  };

  // Configurazioni predefinite
  const applyConfiguration = (config: string) => {
    switch (config) {
      case 'reverse':
        // Inverti l'ordine delle sezioni
        reorderSections(['sezione_ruolo', 'sezione_accesso', 'sezione_anagrafica']);
        break;
      case 'minimal':
        // Mostra solo sezione accesso
        hideSections(['sezione_anagrafica', 'sezione_ruolo']);
        showSections(['sezione_accesso']);
        break;
      case 'readonly_personal':
        // Rendi read-only la sezione anagrafica
        makeSectionReadOnly('sezione_anagrafica');
        break;
      case 'reset':
        // Reset tutto
        showSections(['sezione_anagrafica', 'sezione_accesso', 'sezione_ruolo']);
        makeSectionEditable('sezione_anagrafica');
        makeSectionEditable('sezione_accesso');
        makeSectionEditable('sezione_ruolo');
        reorderSections(['sezione_anagrafica', 'sezione_accesso', 'sezione_ruolo']);
        break;
    }
  };

  // API React e DOM per scorrere e mappare tutto il DOM
  const traverseAllElements = () => {
    const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement;
    if (!formContainer) return [];

    const allElements: any[] = [];

    // Funzione ricorsiva per attraversare tutto il DOM
    const traverse = (node: Node, depth = 0) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const elementInfo = {
          depth,
          tag: element.tagName.toLowerCase(),
          id: element.id || null,
          className: element.className || null,
          type: element.getAttribute('type') || null,
          name: element.getAttribute('name') || null,
          label: element.getAttribute('aria-label') || null,
          textContent: element.textContent?.trim().substring(0, 100) || null,
          isInput: ['input', 'textarea', 'select'].includes(element.tagName.toLowerCase()),
          isButton: element.tagName.toLowerCase() === 'button',
          isSection: element.id?.includes('sezione_') || false,
          element: element,
          path: getElementPath(element)
        };
        allElements.push(elementInfo);
      }

      // Attraversa tutti i nodi figli
      for (let i = 0; i < node.childNodes.length; i++) {
        traverse(node.childNodes[i], depth + 1);
      }
    };

    traverse(formContainer);
    return allElements;
  };

  // Ottieni il percorso CSS di un elemento
  const getElementPath = (element: HTMLElement): string => {
    const path: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector += `#${current.id}`;
      } else {
        // className may not be a string for some elements (SVGAnimatedString etc.)
        let classSelector = '';
        try {
          if (typeof (current.className) === 'string' && current.className.trim()) {
            classSelector = current.className.trim().split(/\s+/).join('.');
          } else if (current.classList && current.classList.length) {
            classSelector = Array.from(current.classList).join('.');
          } else {
            const attr = current.getAttribute && current.getAttribute('class');
            if (attr) classSelector = attr.trim().split(/\s+/).join('.');
          }
        } catch (e) {
          // ignore and continue without class
          classSelector = '';
        }

        if (classSelector) selector += `.${classSelector}`;
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  };

  // Mappa tutti gli input del form
  const mapAllInputs = () => {
    const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement;
    if (!formContainer) return [];

    const inputs = formContainer.querySelectorAll('input, textarea, select') as NodeListOf<HTMLInputElement>;
    return Array.from(inputs).map((input, index) => ({
      index,
      type: input.type,
      name: input.name,
      id: input.id,
      value: input.value,
      disabled: input.disabled,
      required: input.required,
      placeholder: input.placeholder,
      element: input,
      parentSection: input.closest('[id^="sezione_"]')?.id || null
    }));
  };

  // Mappa tutte le sezioni del form
  const mapAllSections = () => {
    const sections = document.querySelectorAll('[id^="sezione_"]') as NodeListOf<HTMLElement>;
    return Array.from(sections).map((section, index) => ({
      index,
      id: section.id,
      visible: section.style.display !== 'none',
      order: section.style.order || index.toString(),
      inputCount: section.querySelectorAll('input, textarea, select').length,
      title: section.querySelector('h1, h2, h3, h4, h5, h6')?.textContent || 
             section.querySelector('[variant="subtitle1"]')?.textContent || 'Senza titolo',
      element: section
    }));
  };

  // Query selector avanzato con filtri
  const queryElements = (selector: string, filters?: {
    visible?: boolean;
    enabled?: boolean;
    hasValue?: boolean;
  }) => {
    const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement;
    if (!formContainer) return [];

    const elements = Array.from(formContainer.querySelectorAll(selector)) as HTMLElement[];
    
    if (!filters) return elements;

    return elements.filter(el => {
      if (filters.visible !== undefined) {
        const isVisible = el.style.display !== 'none' && 
                         !el.hidden && 
                         el.offsetParent !== null;
        if (isVisible !== filters.visible) return false;
      }

      if (filters.enabled !== undefined) {
        const input = el as HTMLInputElement;
        if (input.disabled === filters.enabled) return false;
      }

      if (filters.hasValue !== undefined) {
        const input = el as HTMLInputElement;
        const hasValue = input.value && input.value.trim() !== '';
        if (hasValue !== filters.hasValue) return false;
      }

      return true;
    });
  };

  // Statistiche complete del form
  const getFormStats = () => {
    const allElements = traverseAllElements();
    const allInputs = mapAllInputs();
    const allSections = mapAllSections();

    return {
      totalElements: allElements.length,
      totalInputs: allInputs.length,
      totalSections: allSections.length,
      visibleInputs: allInputs.filter(input => !input.disabled).length,
      filledInputs: allInputs.filter(input => input.value && input.value.trim() !== '').length,
      visibleSections: allSections.filter(section => section.visible).length,
      elements: allElements,
      inputs: allInputs,
      sections: allSections,
      elementsByType: allElements.reduce((acc, el) => {
        acc[el.tag] = (acc[el.tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    try {
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
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: isAgent ? "client" : form.role, // forza client se agent
            createdBy: form.createdBy,
          }),
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
    }
  };



  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      height="100%"
      minHeight="60vh"
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: "100vw",
          height: "100%",
          maxHeight: "100vh",
          borderRadius: 3,

          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          aria-label="Registration Form"
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          flexGrow={1}
        >
          <Box
            id="sezione_anagrafica"
            key="sezione_anagrafica"
            display="flex"
            flexDirection="column"
            gap={2}
            m={2}
          >
            <Typography variant="subtitle1">
              Informazioni anagrafiche
            </Typography>
            <Box
              key="1"
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              width={{ xs: "100%", sm: "50%" }}
              gap={2}
              sx={{ display: 'flex', flexDirection: 'row' }} // Per supportare order
            >
              <TextField
                id="field-name"
                name="name"
                label="Nome"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
              <TextField
                id="field-cognome"
                name="cognome"
                label="Cognome"
                //value={}
                //onChange={handleChange}
                required
                fullWidth
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Box>
          <Divider />
          </Box>


          <Box
            id="sezione_accesso"
            key="sezione_accesso"
            display="flex"
            flexDirection="column"
            gap={2}
            m={2}
          >
            <Typography variant="subtitle1">Accesso</Typography>
            <Box
              key="2"
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={2}
              sx={{ display: 'flex', flexDirection: 'row' }} // Per supportare order
            >
              <TextField
                id="field-email"
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
              <TextField
                id="field-password"
                name="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                fullWidth
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Box>
            <Divider />
          </Box>

          

          <Box
            m={2}
            id="sezione_ruolo"
            key="sezione_ruolo"
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <Typography variant="subtitle1">Ruolo</Typography>
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              width={{ xs: "100%", sm: "50%" }}
              gap={2}
            >
              {!isAgent && (
                <TextField
                  id="field-role"
                  name="role"
                  label="Ruolo"
                  select
                  value={form.role}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="agent">Agent</MenuItem>
                  <MenuItem value="client">Client</MenuItem>
                </TextField>
              )}
            </Box>
            <Divider />
          </Box>
         
        </Box>
        <Divider />
        
        {/* Pannello di controllo per manipolare i campi e sezioni */}
        <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Controlli Sezioni:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Button size="small" onClick={() => applyConfiguration('reverse')}>Inverti Ordine</Button>
            <Button size="small" onClick={() => applyConfiguration('minimal')}>Solo Accesso</Button>
            <Button size="small" onClick={() => applyConfiguration('readonly_personal')}>Anagrafica Read-Only</Button>
            <Button size="small" onClick={() => applyConfiguration('reset')}>Reset</Button>
            <Button size="small" onClick={() => hideSections(['sezione_ruolo'])}>Nascondi Ruolo</Button>
            <Button size="small" onClick={() => showSections(['sezione_ruolo'])}>Mostra Ruolo</Button>
          </Box>
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>API DOM Mapping:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Button size="small" onClick={() => console.log('Tutti gli elementi:', traverseAllElements())}>
              Log Tutti Elementi
            </Button>
            <Button size="small" onClick={() => console.log('Tutti gli input:', mapAllInputs())}>
              Log Tutti Input
            </Button>
            <Button size="small" onClick={() => console.log('Tutte le sezioni:', mapAllSections())}>
              Log Tutte Sezioni
            </Button>
            <Button size="small" onClick={() => console.log('Statistiche form:', getFormStats())}>
              Log Statistiche
            </Button>
            <Button size="small" onClick={() => console.log('Input visibili:', queryElements('input', { visible: true }))}>
              Log Input Visibili
            </Button>
            <Button size="small" onClick={() => console.log('Input compilati:', queryElements('input', { hasValue: true }))}>
              Log Input Compilati
            </Button>
          </Box>
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Controlli Singoli Campi:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" onClick={() => hideField('field-cognome')}>Nascondi Cognome</Button>
            <Button size="small" onClick={() => showField('field-cognome')}>Mostra Cognome</Button>
            <Button size="small" onClick={() => makeFieldReadOnly('field-email')}>Email Read-Only</Button>
            <Button size="small" onClick={() => makeFieldEditable('field-email')}>Email Editabile</Button>
            <Button size="small" onClick={() => reorderField('field-password', 1)}>Password Prima</Button>
            <Button size="small" onClick={() => reorderField('field-email', 1)}>Email Prima</Button>
          </Box>
          
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            Sezioni disponibili: {getAllSections().map(s => s.name).join(', ')} | 
            Campi disponibili: {getAllFields().map(f => f.name).join(', ')}
          </Typography>
        </Box>
        
        <Divider />
        <Box display="flex" p={2} justifyContent="flex-end" gap={2}>
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            Annulla
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Invia
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Registrazione avvenuta con successo!
        </Alert>
      </Snackbar>
    </Box>
  );
}
