# Sistema di Customizzazione Migliorato

Questo documento descrive le nuove funzionalità implementate per il sistema di customizzazione.

## Nuove Funzionalità

### 1. Sistema di Restrizioni Admin per i Campi
Gli amministratori possono ora bloccare specifici campi o sezioni dall'essere modificati dagli agenti.

**Caratteristiche:**
- **Campo adminLocked**: Quando impostato su `true`, solo gli admin possono modificare il campo
- **Sezione adminLocked**: Quando impostata su `true`, solo gli admin possono modificare l'intera sezione
- **Indicatori visivi**: Icona lucchetto per mostrare i campi bloccati
- **Pannello admin**: Interfaccia dedicata per gestire le restrizioni

### 2. Interfaccia Compatta (CompactCustomizableForm)
Nuova versione compatta dell'interfaccia form con le seguenti caratteristiche:

**Miglioramenti UI:**
- **Layout più compatto**: Uso ottimizzato dello spazio verticale
- **Sezioni collassabili**: Ogni sezione può essere espansa/compressa
- **Griglia responsive**: Layout automatico dei campi in base allo spazio
- **Indicatori di stato**: Chip e icone per mostrare stato compatto/esteso
- **Scroll area limitata**: Altezza massima 70vh con scroll interno

**Nuove proprietà:**
- `compactMode`: Abilita/disabilita modalità compatta
- `compactInterface`: Impostazione globale per interfaccia compatta

### 3. Persistenza Server
Le configurazioni ora vengono salvate persistentemente nel database.

**Backend Components:**
- `UserSettings` entity: Memorizza configurazioni personalizzate
- `UserSettingsService`: Gestisce CRUD delle impostazioni
- `UserSettingsController`: API endpoints per le impostazioni
- `AdminFieldRestrictions`: Campo JSON per restrizioni admin

**API Endpoints:**
- `GET /user-settings/my-settings`: Ottieni le tue impostazioni
- `PUT /user-settings/my-settings/customization`: Aggiorna configurazioni
- `PUT /user-settings/admin/field-restrictions/:userId`: Imposta restrizioni (solo admin)

### 4. Hook useServerCustomization
Nuovo hook che estende `useCustomization` con persistenza server:

**Nuove funzionalità:**
- Caricamento automatico da server al login
- Salvataggio automatico sul server
- Fallback a localStorage in caso di errori
- Gestione stati di loading ed errore
- Funzioni admin per impostare restrizioni

## Utilizzo

### Form Compatto
```tsx
import { CompactCustomizableForm } from './components/Customization';

<CompactCustomizableForm
  formId="user-registration"
  sections={formSections}
  customization={customization}
  onCustomizationChange={handleChange}
  onSubmit={handleSubmit}
  compactMode={true} // Modalità compatta
/>
```

### Gestione Restrizioni Admin
```tsx
import { AdminFieldRestrictions } from './components/Customization';

<AdminFieldRestrictions
  formId="user-registration"
  sections={formSections}
  targetUserId={targetUserId}
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
/>
```

### Hook Server
```tsx
import { useServerCustomization } from './hooks/useServerCustomization';

const {
  config,
  loading,
  error,
  updateFormCustomization,
  updateAdminFieldRestrictions, // Solo per admin
  refreshConfig,
} = useServerCustomization();
```

## Configurazione Database

### Nuova Tabella user_settings
```sql
CREATE TABLE user_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  customizationConfig JSON,
  adminFieldRestrictions JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);
```

## Sicurezza

### Controlli di Accesso
- **Restrizioni Admin**: Solo utenti con ruolo 'admin' possono impostare restrizioni
- **Validazione Server**: Tutti i campi bloccati sono verificati lato server
- **JWT Authentication**: Tutte le API richiedono autenticazione

### Tipi di Restrizioni
1. **Campo Read-Only**: Campo visualizzabile ma non modificabile
2. **Campo Admin-Locked**: Campo modificabile solo da admin
3. **Sezione Admin-Locked**: Intera sezione modificabile solo da admin

## Best Practices

### Per Sviluppatori
1. **Sempre verificare il ruolo utente** prima di consentire modifiche
2. **Utilizzare indicatori visivi** per campi bloccati
3. **Implementare fallback** per errori di rete
4. **Testare con diversi ruoli utente**

### Per Admin
1. **Bloccare solo campi critici** per mantenere usabilità
2. **Comunicare le restrizioni** agli utenti
3. **Monitorare l'uso** delle configurazioni personalizzate

## Troubleshooting

### Problemi Comuni
1. **Configurazioni non salvate**: Verificare autenticazione e permessi
2. **Campi non bloccati**: Controllare ruolo utente e configurazioni admin
3. **Performance lenta**: Considerare cache delle configurazioni

### Debug
- Usare il pannello debug auth per verificare token e ruoli
- Controllare console browser per errori di rete
- Verificare database per configurazioni salvate
