# Dialog di Customizzazione Unificato con Drag & Drop

## Caratteristiche Principali

### 🎯 Dialog Unificato
- **Un'unica interfaccia** per tutte le customizzazioni del form
- **Due tab principali**: Struttura e Ordine + Layout Globale
- **Interfaccia intuitiva** con indicatori visivi chiari

### 🔀 Drag & Drop
- **Riordino sezioni**: Trascina le sezioni per cambiare l'ordine
- **Riordino campi**: All'interno di ogni sezione, trascina i campi
- **Feedback visuale**: Elementi evidenziati durante il trascinamento
- **Animazioni fluide**: Transizioni smooth per una UX professionale

### 🎛️ Controlli per Sezione
- **👁️ Visibilità**: Mostra/Nascondi sezione
- **🔒 Read-Only**: Rendi la sezione solo lettura
- **👨‍💼 Admin Lock**: (Solo admin) Blocca la sezione per gli agenti

### 🎛️ Controlli per Campo
- **👁️ Visibilità**: Mostra/Nascondi campo
- **🔒 Read-Only**: Rendi il campo solo lettura  
- **✅ Richiesto**: Campo obbligatorio/opzionale
- **👨‍💼 Admin Lock**: (Solo admin) Blocca il campo per gli agenti

### 🌐 Layout Globale
- **Layout Form**: Verticale, Orizzontale, Griglia
- **Modalità Compatta**: UI più densa per risparmiare spazio

## Utilizzo

### Apertura Dialog
Il dialog si apre cliccando sull'icona ⚙️ nel form.

### Tab "Struttura e Ordine"
1. **Riordinare Sezioni**:
   - Clicca e trascina l'icona ☰ di una sezione
   - Rilascia nella nuova posizione
   
2. **Configurare Sezione**:
   - **👁️**: Toggle visibilità
   - **🔒**: Toggle read-only
   - **👨‍💼**: (Admin) Toggle blocco per agenti

3. **Riordinare Campi**:
   - Espandi una sezione
   - Trascina i campi per riordinarli
   
4. **Configurare Campo**:
   - **👁️**: Toggle visibilità
   - **🔒**: Toggle read-only
   - **Switch "Richiesto"**: Campo obbligatorio
   - **👨‍💼**: (Admin) Toggle blocco per agenti

### Tab "Layout Globale"
1. **Layout Form**:
   - **Verticale**: Campi impilati verticalmente
   - **Orizzontale**: Campi affiancati
   - **Griglia**: Layout responsivo in griglia

2. **Modalità Compatta**:
   - Switch per abilitare UI più densa

## Indicatori Visivi

### Colori Sezioni
- **🟢 Verde**: Sezione normale
- **🟡 Giallo**: Sezione read-only
- **🔴 Rosso**: Sezione nascosta

### Icone
- **☰**: Handle per drag & drop
- **👁️/👁️‍🗨️**: Visibilità attiva/nascosta
- **🔒/🔓**: Read-only attivo/disattivo
- **👨‍💼**: Blocco admin
- **✅**: Campo richiesto

### Chip Informativi
- **Tipo Campo**: Mostra il tipo (text, email, etc.)
- **Contatori**: Numero sezioni e campi totali

## Flusso di Salvataggio

1. **Modifica Temporanea**: Le modifiche sono temporanee fino al salvataggio
2. **Anteprima Live**: Vedi subito l'effetto delle modifiche
3. **Salvataggio**: Clicca "Salva Personalizzazioni"
4. **Persistenza**: Le configurazioni vengono salvate nel database

## Funzionalità Admin

### Restrizioni Campi/Sezioni
Gli amministratori possono bloccare elementi specifici:
- **Campo Admin-Locked**: Solo admin possono modificarlo
- **Sezione Admin-Locked**: Solo admin possono accedere alla sezione

### Controllo Granulare
- Blocco individuale per ogni campo
- Blocco dell'intera sezione
- Indicatori visivi per elementi bloccati

## Accessibilità

### Keyboard Support
- **Tab**: Navigazione tra controlli
- **Space/Enter**: Attivazione controlli
- **Arrow Keys**: Navigazione nella lista drag

### Screen Reader
- Etichette descrittive per tutti i controlli
- Annunci per le azioni di drag & drop
- Ruoli ARIA appropriati

## Performance

### Ottimizzazioni
- **Rendering ottimizzato**: Solo componenti necessari si re-renderizzano
- **Debounce**: Le azioni rapide sono raggruppate
- **Lazy Loading**: Sezioni caricate on-demand

### Gestione Stato
- Stato temporaneo durante modifica
- Sincronizzazione con store globale al salvataggio
- Fallback localStorage per persistenza locale

## Risoluzione Problemi

### Drag & Drop Non Funziona
1. Verificare che la libreria @dnd-kit sia installata
2. Controllare che i sensori siano configurati
3. Verificare permessi utente per la modifica

### Configurazioni Non Salvate
1. Controllare connessione al server
2. Verificare token di autenticazione
3. Consultare console browser per errori

### Performance Lenta
1. Ridurre numero di campi/sezioni
2. Abilitare modalità compatta
3. Ottimizzare configurazioni complesse
