# 🔧 Guida Test Fix: Salvataggio Server Grid

## 📋 Riassunto del Fix Applicato

**Problema:** Il sistema salvava sempre solo nel localStorage, mai nel server.

**Causa:** `useUserCustomization.ts` importava direttamente `useCustomization` (localStorage-only) invece di usare il `CustomizationProvider` che fornisce `useServerCustomization`.

**Fix Applicato:** Cambiato l'import in `useUserCustomization.ts`:
```typescript
// PRIMA (sbagliato)
import { useCustomization } from './useCustomization';

// DOPO (corretto)
import { useCustomizationContext } from '../components/CustomizableProvider';
```

---

## 🧪 Test Manuale

### Step 1: Verifica Backend
```bash
# Assicurati che il backend sia in esecuzione
cd backend
npm run start:dev
```

### Step 2: Verifica Frontend
```bash
# Assicurati che il frontend sia in esecuzione
cd frontend
npm run dev
```

### Step 3: Login
1. Vai su `http://localhost:3000/login`
2. Fai login con le tue credenziali
3. Verifica che il token JWT sia salvato in localStorage

### Step 4: Test Grid Customization
1. Vai su `http://localhost:3000/user/customizable`
2. Trova la tabella utenti
3. Clicca l'icona ⚙️ (personalizzazione) sulla tabella
4. Modifica qualcosa:
   - Nascondi/mostra una colonna
   - Cambia l'ordine delle colonne
   - Modifica la larghezza
5. Clicca "Salva"

### Step 5: Verifica Logs Console
Apri Developer Tools (F12) e guarda la console. Dovresti vedere:

**✅ PRIMA del fix (solo localStorage):**
```
🔄 Salvando nel localStorage...
✅ Configurazioni salvate localmente
```

**✅ DOPO il fix (server + localStorage):**
```
🔄 Tentativo di salvataggio configurazioni...
📤 Invio richiesta al server con userId: 123
✅ Configurazioni salvate sul server
🔄 Fallback localStorage...
✅ Configurazioni salvate anche localmente
```

### Step 6: Verifica Network Tab
1. Apri Developer Tools → Network tab
2. Ripeti la modifica grid
3. Dovresti vedere una chiamata:
   - `PUT /api/user-settings/my-settings/customization`
   - Headers con `Authorization: Bearer <token>`
   - Status 200 OK

---

## 🚨 Troubleshooting

### Problema: Non vedo chiamate al server
**Cause possibili:**
- Token JWT mancante o scaduto
- Backend non in esecuzione
- CORS issues

**Soluzioni:**
1. Logout e login di nuovo
2. Verifica `localStorage.getItem('token')`
3. Controlla che backend sia su porta 3001
4. Verifica CORS nel backend

### Problema: Errore 401 Unauthorized
**Causa:** Token non valido
**Soluzione:** 
1. Fai logout
2. Fai login di nuovo
3. Verifica che il token sia aggiornato

### Problema: Errore 500 Internal Server Error
**Causa:** Errore nel backend
**Soluzione:**
1. Controlla i logs del backend
2. Verifica database connection
3. Controlla che l'entity UserSettings sia configurata

---

## 📊 Test Automatico

Puoi anche usare il file di test automatico:

1. Apri la console del browser su `http://localhost:3000`
2. Carica e esegui il test:
```javascript
// Carica il file test
const script = document.createElement('script');
script.src = '/test-server-fix.js';
document.head.appendChild(script);
```

3. Il test verificherà automaticamente:
   - Presenza token JWT
   - AuthContext attivo
   - Interceptazione chiamate API
   - Logs di salvataggio

---

## ✅ Risultato Atteso

Dopo il fix, quando modifichi una grid:

1. **Il sistema prova SEMPRE a salvare sul server**
2. **Se il server è raggiungibile e l'utente è autenticato:** salva sul server
3. **Se il server non è raggiungibile:** fallback su localStorage
4. **In ogni caso:** salva anche localmente come backup

Questo garantisce che:
- Le configurazioni persistano tra sessioni diverse
- Le configurazioni siano condivise tra dispositivi diversi (se salvate sul server)
- Il sistema funzioni anche offline (fallback localStorage)

---

## 🎯 File Modificati

- `src/app/hooks/useUserCustomization.ts` - Fix import principale
- `test-server-fix.js` - Test automatico aggiunto

## 📝 Prossimi Passi

Se il test conferma che funziona:
1. Considera di aggiungere più logging per debugging
2. Implementa toast notifications per successo/errore
3. Aggiungi indicatori UI per mostrare quando salva server vs localStorage
