// Esempio di implementazione AdminLock nella CustomizableUsersTable

import React, { useState, useContext } from 'react';
import { GridColumn } from '../components/Customization/types/customization.types';
import { GridCustomizationDialog } from '../components/Customization/components/GridCustomizationDialog';
import { AuthContext } from '../components/Authcontext';

// 🔒 Esempio: Colonne con AdminLock predefinito
const usersColumns: GridColumn[] = [
  {
    id: 'id',
    label: 'ID Utente',
    width: 80,
    sortable: true,
    adminLock: true, // 🔒 SEMPRE bloccata - ID critico per sistema
  },
  {
    id: 'email',
    label: 'Email',
    width: 200,
    sortable: true,
    adminLock: true, // 🔒 SEMPRE bloccata - Dato sensibile
  },
  {
    id: 'role',
    label: 'Ruolo',
    width: 120,
    sortable: true,
    adminLock: true, // 🔒 SEMPRE bloccata - Controllo accessi
  },
  {
    id: 'name',
    label: 'Nome',
    width: 150,
    sortable: true,
    // adminLock: false (default) - 🔓 Modificabile da tutti
  },
  {
    id: 'createdAt',
    label: 'Data Creazione',
    width: 140,
    sortable: true,
    // adminLock: false - 🔓 Modificabile da tutti
  },
  {
    id: 'lastLogin',
    label: 'Ultimo Accesso',
    width: 140,
    sortable: true,
    // adminLock: false - 🔓 Modificabile da tutti
  },
  {
    id: 'status',
    label: 'Stato',
    width: 100,
    sortable: true,
    // adminLock: false - 🔓 Modificabile da tutti
  }
];

// 🎯 Esempio: Configurazione con lock runtime personalizzati
const exampleConfig = {
  pageSize: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
  adminLock: false, // 🔓 Grid globalmente modificabile
  columns: [
    {
      id: 'id',
      order: 1,
      hidden: false,
      width: 80,
      adminLock: true // Lock confermato runtime
    },
    {
      id: 'email',
      order: 2,
      hidden: false,
      width: 200,
      adminLock: true // Lock confermato runtime
    },
    {
      id: 'role',
      order: 3,
      hidden: false,
      width: 120,
      adminLock: true // Lock confermato runtime
    },
    {
      id: 'name',
      order: 4,
      hidden: false,
      width: 150,
      adminLock: false // 🔓 Libera per tutti
    },
    {
      id: 'createdAt',
      order: 5,
      hidden: false,
      width: 140,
      adminLock: false // 🔓 Libera per tutti
    },
    {
      id: 'lastLogin',
      order: 6,
      hidden: true, // Nascosta di default ma modificabile
      width: 140,
      adminLock: false // 🔓 Libera per tutti
    },
    {
      id: 'status',
      order: 7,
      hidden: false,
      width: 100,
      adminLock: false // 🔓 Libera per tutti
    }
  ]
};

// 📊 Esempio di utilizzo nel componente
export function ExampleUsersTableWithAdminLock() {
  const [showCustomization, setShowCustomization] = useState(false);
  const [gridConfig, setGridConfig] = useState(exampleConfig);
  
  const authContext = useContext(AuthContext);
  const isAdmin = authContext?.user?.role === 'admin';

  const handleSaveConfig = (newConfig: any) => {
    console.log('💾 Salvando configurazione:', newConfig);
    
    // 🔍 Verifica che gli admin lock siano rispettati
    const hasAdminLocks = newConfig.columns?.some((col: any) => col.adminLock);
    if (hasAdminLocks) {
      console.log('🔒 Configurazione contiene lock admin');
    }
    
    setGridConfig(newConfig);
    setShowCustomization(false);
    
    // 📤 Qui andresti a salvare sul server
    // useServerCustomization().updateGridCustomization('users-table', newConfig);
  };

  return (
    <div>
      <h2>👥 Tabella Utenti con AdminLock</h2>
      
      {/* 🎛️ Bottone per aprire personalizzazione */}
      <button 
        onClick={() => setShowCustomization(true)}
        style={{ 
          padding: '10px 20px', 
          marginBottom: '20px',
          backgroundColor: isAdmin ? '#1976d2' : '#757575',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ⚙️ Personalizza Grid {isAdmin && '(Admin)'}
      </button>

      {/* 📋 Informazioni per sviluppatore */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '4px', 
        marginBottom: '20px' 
      }}>
        <h3>ℹ️ Info Configurazione Attuale:</h3>
        <ul>
          <li><strong>Utente:</strong> {authContext?.user?.email} ({authContext?.user?.role})</li>
          <li><strong>È Admin:</strong> {isAdmin ? '✅ Sì' : '❌ No'}</li>
          <li><strong>Grid bloccata:</strong> {gridConfig.adminLock ? '🔒 Sì' : '🔓 No'}</li>
          <li><strong>Colonne bloccate:</strong> {gridConfig.columns?.filter(col => col.adminLock).length} di {gridConfig.columns?.length}</li>
        </ul>
      </div>

      {/* 🔒 Lista colonne e loro stato lock */}
      <div style={{ marginBottom: '20px' }}>
        <h3>📋 Stato Colonne:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {usersColumns.map(col => {
            const configCol = gridConfig.columns?.find(c => c.id === col.id);
            const isLocked = configCol?.adminLock || col.adminLock;
            const isHidden = configCol?.hidden;
            
            return (
              <div 
                key={col.id} 
                style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  backgroundColor: isLocked ? '#ffebee' : '#e8f5e8'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {isLocked ? '🔒' : '🔓'} {col.label}
                </div>
                <div style={{ fontSize: '0.8em', color: '#666' }}>
                  ID: {col.id}
                </div>
                <div style={{ fontSize: '0.8em' }}>
                  {isLocked ? '🔒 Admin Lock' : '🔓 Modificabile'}
                </div>
                {isHidden && (
                  <div style={{ fontSize: '0.8em', color: '#f44336' }}>
                    👁️‍🗨️ Nascosta
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎛️ Dialog di personalizzazione */}
      <GridCustomizationDialog
        open={showCustomization}
        onClose={() => setShowCustomization(false)}
        gridId="users-table"
        columns={usersColumns}
        currentConfig={gridConfig}
        onSave={handleSaveConfig}
      />

      {/* 📝 Note per sviluppatore */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '4px' 
      }}>
        <h3>💡 Test Scenarios:</h3>
        <ol>
          <li><strong>Come Admin:</strong> Apri personalizzazione → Vedi tab "Admin" → Puoi modificare tutti i lock</li>
          <li><strong>Come User:</strong> Apri personalizzazione → Solo tab base → Colonne 🔒 non modificabili</li>
          <li><strong>Lock Globale:</strong> Come admin, attiva "Blocco Globale Grid" → Gli user vedranno tutto disabilitato</li>
          <li><strong>Lock Specifico:</strong> Come admin, blocca/sblocca singole colonne nel tab "Admin"</li>
        </ol>
      </div>
    </div>
  );
}

// 🚀 Esportazione per uso in app
export default ExampleUsersTableWithAdminLock;

/* 
📝 COME USARE QUESTO ESEMPIO:

1. Importa il componente nella tua app
2. Assicurati che AuthContext sia configurato
3. Testa con utenti admin e normali
4. Osserva comportamenti diversi per each role
5. Modifica usersColumns per i tuoi use case

🔒 COLONNE SEMPRE BLOCCATE (adminLock: true):
- ID: Critico per integrità dati
- Email: Dato sensibile per privacy  
- Role: Controllo accessi e sicurezza

🔓 COLONNE MODIFICABILI (adminLock: false):
- Name: Personalizzazione nome display
- CreatedAt: Info visualizzazione data
- LastLogin: Monitoraggio accessi
- Status: Stati operativi

*/
