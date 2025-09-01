// Test per verificare il salvataggio delle grid configurations
// Questo file testa sia il localStorage che la comunicazione con il server

console.log('🔍 Inizio test per il salvataggio delle grid configurations...');

// Test 1: Verifica localStorage
function testLocalStorage() {
  console.log('\n📦 Test 1: Verifica localStorage');
  
  const testConfig = {
    grids: {
      'users-table': {
        columns: [
          { id: 'name', label: 'Nome', visible: true, order: 1 },
          { id: 'email', label: 'Email', visible: true, order: 2 }
        ],
        filters: {},
        sorting: { field: 'name', direction: 'asc' }
      }
    },
    forms: {},
    global: {
      theme: 'light',
      language: 'it',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    }
  };

  try {
    // Salva nel localStorage
    const storageKey = 'track_customization_test';
    localStorage.setItem(storageKey, JSON.stringify(testConfig));
    console.log('✅ Configurazione salvata nel localStorage');

    // Leggi dal localStorage
    const savedConfig = localStorage.getItem(storageKey);
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      console.log('✅ Configurazione letta dal localStorage:', parsedConfig);
      
      // Verifica che i dati siano corretti
      if (JSON.stringify(parsedConfig) === JSON.stringify(testConfig)) {
        console.log('✅ Dati del localStorage sono corretti');
      } else {
        console.error('❌ Dati del localStorage non corrispondono');
      }
    } else {
      console.error('❌ Nessuna configurazione trovata nel localStorage');
    }

    // Pulisci
    localStorage.removeItem(storageKey);
    console.log('🧹 localStorage pulito');

  } catch (error) {
    console.error('❌ Errore nel test localStorage:', error);
  }
}

// Test 2: Simula chiamata al server
async function testServerCommunication() {
  console.log('\n🌐 Test 2: Simula comunicazione con il server');
  
  const API_BASE_URL = 'http://localhost:3001';
  const testConfig = {
    grids: {
      'users-table': {
        columns: [
          { id: 'name', label: 'Nome', visible: true, order: 1 },
          { id: 'email', label: 'Email', visible: true, order: 2 }
        ]
      }
    },
    forms: {},
    global: { theme: 'light' }
  };

  // Simula il token (sostituisci con un token valido per test reali)
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('⚠️ Nessun token trovato - test server saltato (normale se non autenticato)');
    return;
  }

  try {
    console.log('📤 Tentativo di salvataggio sul server...');
    
    // Test PUT request
    const response = await fetch(`${API_BASE_URL}/user-settings/my-settings/customization`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customizationConfig: testConfig }),
    });

    console.log('📥 Risposta server:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Configurazione salvata sul server:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ Errore response server:', errorText);
    }

    // Test GET request per verificare il caricamento
    console.log('📤 Tentativo di caricamento dal server...');
    const getResponse = await fetch(`${API_BASE_URL}/user-settings/my-settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ Configurazione caricata dal server:', data);
      
      // Verifica che la configurazione sia stata salvata correttamente
      if (data.customizationConfig) {
        console.log('✅ customizationConfig trovato nel response');
      } else {
        console.log('⚠️ customizationConfig non trovato nel response');
      }
    } else {
      const errorText = await getResponse.text();
      console.error('❌ Errore nel caricamento dal server:', errorText);
    }

  } catch (error) {
    console.error('❌ Errore nella comunicazione con il server:', error);
  }
}

// Test 3: Verifica formato delle configurazioni grid
function testGridConfigFormat() {
  console.log('\n📋 Test 3: Verifica formato configurazioni grid');
  
  const validGridConfig = {
    columns: [
      {
        id: 'name',
        label: 'Nome',
        visible: true,
        order: 1,
        width: 200,
        sortable: true,
        filterable: true
      },
      {
        id: 'email',
        label: 'Email',
        visible: true,
        order: 2,
        width: 250,
        sortable: true,
        filterable: true
      }
    ],
    filters: {
      name: 'test',
      email: ''
    },
    sorting: {
      field: 'name',
      direction: 'asc'
    },
    pagination: {
      page: 1,
      pageSize: 10
    }
  };

  try {
    // Verifica che la configurazione sia serializzabile
    const serialized = JSON.stringify(validGridConfig);
    const deserialized = JSON.parse(serialized);
    
    if (JSON.stringify(deserialized) === serialized) {
      console.log('✅ Formato configurazione grid valido');
    } else {
      console.error('❌ Formato configurazione grid non valido');
    }

    // Verifica campi obbligatori
    const requiredFields = ['columns'];
    const missingFields = requiredFields.filter(field => !(field in validGridConfig));
    
    if (missingFields.length === 0) {
      console.log('✅ Tutti i campi obbligatori presenti');
    } else {
      console.error('❌ Campi obbligatori mancanti:', missingFields);
    }

  } catch (error) {
    console.error('❌ Errore nel test formato grid:', error);
  }
}

// Esegui tutti i test
async function runAllTests() {
  testLocalStorage();
  await testServerCommunication();
  testGridConfigFormat();
  console.log('\n🏁 Test completati!');
}

// Esegui i test se il file viene eseguito direttamente
if (typeof window !== 'undefined') {
  runAllTests();
} else {
  console.log('Questo script deve essere eseguito in un browser con accesso a localStorage');
}
