# 🧪 Test AdminLock - Procedura Completa

## 🚀 Setup Test Environment

### 1. Preparazione Database
```sql
-- Verifica che user_settings supporti adminFieldRestrictions
SELECT * FROM user_settings LIMIT 5;

-- Crea utenti di test se non esistenti
-- Admin user
INSERT INTO users (email, password, role) VALUES 
('admin@test.com', '$hashed_password', 'admin');

-- Normal user  
INSERT INTO users (email, password, role) VALUES 
('user@test.com', '$hashed_password', 'agent');
```

### 2. Avvio Applicazione
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend  
npm run dev
```

---

## 🎯 Test Scenarios

### 🔐 Test 1: Login come Admin

#### Setup:
```bash
Email: admin@test.com
Password: [your_admin_password]
```

#### Verifica:
1. **Dashboard Access** ✅
   - Navigazione a `/user/customizable` 
   - Presenza icona ⚙️ personalizzazione

2. **Dialog Access** ✅
   - Click su ⚙️ → Dialog si apre
   - Presenza Tab "Admin" con icona `AdminPanelSettings`
   - Badge "Admin" nel titolo

3. **Admin Tab Features** ✅
   ```
   ✅ "Controlli Admin - Gestione Blocchi" visibile
   ✅ Toggle "Blocco Globale Grid"
   ✅ Sezione "Statistiche Blocchi Colonne"  
   ✅ Lista "Gestione Blocchi per Colonna"
   ✅ Tutti lock/unlock buttons attivi
   ```

4. **Column Lock Control** ✅
   - Click su 🔓 → Diventa 🔒 (colonna bloccata)
   - Click su 🔒 → Diventa 🔓 (colonna sbloccata)
   - Statistiche si aggiornano in tempo reale

### 👤 Test 2: Login come Utente Normale

#### Setup:
```bash
Email: user@test.com  
Password: [your_user_password]
```

#### Verifica:
1. **Limited Dialog Access** ✅
   - Dialog si apre normalmente
   - Tab "Admin" NON presente
   - Badge "Admin" NON presente

2. **Locked Columns Behavior** ✅
   ```
   ❌ Colonne con 🔒 non modificabili
   ❌ Drag handle disabilitato per colonne locked
   ❌ Switch visibilità disabilitato per colonne locked
   ❌ TextField larghezza disabilitato per colonne locked
   ```

3. **Error Messages** ✅
   - Tentativo drag di colonna locked → Alert errore
   - Tentativo modifica visibilità → Alert errore  
   - Tentativo modifica larghezza → Alert errore

4. **Free Columns Behavior** ✅
   ```
   ✅ Colonne senza 🔒 completamente modificabili
   ✅ Drag and drop funziona
   ✅ Switch visibilità funziona
   ✅ TextField larghezza funziona
   ```

### 🔒 Test 3: Global Grid Lock

#### Setup (come Admin):
1. Apri Dialog → Tab Admin
2. Attiva "Blocco Globale Grid" 
3. Salva configurazione
4. Logout → Login come user normale

#### Verifica (come User):
```
❌ TUTTI i controlli disabilitati
❌ Tab Ordinamento: Select disabilitati  
❌ Tab Paginazione: TextField disabilitato
❌ Tab Colonne: Drag, switch, width tutti disabilitati
❌ Alert: "configurazione è bloccata dall'admin"
```

---

## 📊 Test Data Scenarios

### Scenario A: Mixed Lock Configuration
```typescript
const testConfig = {
  adminLock: false, // Grid globalmente libera
  columns: [
    { id: 'id', adminLock: true },      // 🔒 Bloccata
    { id: 'email', adminLock: true },   // 🔒 Bloccata  
    { id: 'name', adminLock: false },   // 🔓 Libera
    { id: 'role', adminLock: false }    // 🔓 Libera
  ]
};
```

**Expected Results:**
- Admin: Può modificare tutto
- User: Solo `name` e `role` modificabili

### Scenario B: Full Lock Configuration  
```typescript
const testConfig = {
  adminLock: true, // 🔒 Grid completamente bloccata
  columns: [/* any config */]
};
```

**Expected Results:**
- Admin: Può modificare tutto  
- User: Niente modificabile, alert su ogni tentativo

### Scenario C: No Locks Configuration
```typescript
const testConfig = {
  adminLock: false, // 🔓 Grid libera
  columns: [
    { id: 'id', adminLock: false },     // 🔓 Libera
    { id: 'email', adminLock: false },  // 🔓 Libera
    { id: 'name', adminLock: false },   // 🔓 Libera
    { id: 'role', adminLock: false }    // 🔓 Libera
  ]
};
```

**Expected Results:**
- Admin: Può modificare tutto + ha tab Admin
- User: Può modificare tutto

---

## 🎨 Visual Testing Checklist

### Icons & Colors
```
🔒 Lock Icon: 
  - Rosso per users normali
  - Arancione per admin
  
🔓 LockOpen Icon:
  - Grigio default
  
⚙️ AdminPanelSettings:
  - Blu primary nei tab e badge
```

### Chips & Badges
```
[Admin] - Badge blu primary
[3 bloccate admin] - Chip warning arancione
[Grid bloccata admin] - Chip error rosso  
[Bloccata] - Chip error nelle liste
```

### Background Colors
```
Colonne bloccate: Background grigio (#f5f5f5)
Sezioni admin: Background azzurro chiaro (#e3f2fd)
Alert warning: Background giallo chiaro
Alert error: Background rosso chiaro
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Tab Admin non appare
**Cause:** User non ha role 'admin'
**Solution:** Verifica `authContext?.user?.role === 'admin'`

### Issue 2: Lock non persiste al reload
**Cause:** Configurazione non salvata sul server
**Solution:** Verifica chiamata API `PUT /user-settings/my-settings/customization`

### Issue 3: Drag funziona su colonne locked
**Cause:** Controllo adminLock non implementato in SortableItem
**Solution:** Verifica prop `canModify` e attributi condizionali

### Issue 4: Error alerts non mostrano
**Cause:** State `error` non configurato
**Solution:** Verifica `setError()` nei handler e `<Alert>` nel render

---

## 📱 Mobile/Responsive Testing

### Tablet View
- Tab Admin deve rimanere accessibile
- Liste colonne scrollabili
- Tooltip funzionanti al touch

### Mobile View  
- Dialog responsive
- Controlli touch-friendly
- Text leggibile anche su schermi piccoli

---

## ⚡ Performance Testing

### Large Datasets
```typescript
// Test con 50+ colonne
const manyColumns = Array.from({length: 50}, (_, i) => ({
  id: `col_${i}`,
  label: `Column ${i}`,
  adminLock: i % 3 === 0 // 1/3 bloccate
}));
```

**Expected:** UI rimane responsiva, scroll fluido

### Multiple Users
- Test simultaneo admin + user
- Configurazioni indipendenti
- No conflicts tra sessioni

---

## 🎉 Success Criteria

### ✅ Admin Functionality
- [ ] Tab Admin presente e funzionale
- [ ] Lock/unlock singole colonne  
- [ ] Toggle global lock
- [ ] Statistiche aggiornate real-time
- [ ] Tutti controlli accessibili

### ✅ User Restrictions
- [ ] Colonne locked non modificabili
- [ ] Error messages appropriati
- [ ] UI disabled correttamente
- [ ] Drag restrictions funzionanti

### ✅ Visual Design
- [ ] Icons correct e colorati
- [ ] Chips e badges presenti
- [ ] Background colors appropriati
- [ ] Responsive su tutti device

### ✅ Data Persistence
- [ ] Configurazioni salvate server
- [ ] Lock persistono tra sessioni
- [ ] Fallback localStorage funzionante

---

## 📝 Test Report Template

```markdown
## Test AdminLock Report

**Data:** [DATE]
**Tester:** [NAME]  
**Environment:** [DEV/STAGING/PROD]

### Admin Tests
- [ ] ✅/❌ Tab Admin presente
- [ ] ✅/❌ Lock controls funzionanti  
- [ ] ✅/❌ Statistics accurate
- [ ] ✅/❌ Global lock effective

### User Tests  
- [ ] ✅/❌ Locked columns protected
- [ ] ✅/❌ Error messages shown
- [ ] ✅/❌ Free columns editable
- [ ] ✅/❌ UI properly disabled

### Issues Found
1. [Description]
2. [Description]

### Notes
[Additional observations]
```

---

## 🚀 Next Steps After Testing

1. **🔧 Fix Issues**: Address any problems found
2. **📚 Documentation**: Update user guides  
3. **🎓 Training**: Educate admins on new features
4. **📊 Monitoring**: Set up usage analytics
5. **🔄 Iteration**: Plan next enhancements based on feedback

Ready to test! 🚀🔒
