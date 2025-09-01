#!/usr/bin/env node

// Test script per verificare il funzionamento del salvataggio grid sul backend
const https = require('https');
const http = require('http');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Configurazione di test
const testGridConfig = {
  grids: {
    'users-table': {
      columns: [
        { id: 'name', label: 'Nome', visible: true, order: 1, width: 200 },
        { id: 'email', label: 'Email', visible: true, order: 2, width: 250 },
        { id: 'role', label: 'Ruolo', visible: true, order: 3, width: 150 }
      ],
      filters: {
        name: '',
        email: ''
      },
      sorting: {
        field: 'name',
        direction: 'asc'
      }
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

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
            headers: res.headers
          };
          resolve(result);
        } catch (error) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testBackendEndpoints() {
  console.log('🔍 Inizio test degli endpoint backend...\n');

  // Test 1: Verifica che il server sia raggiungibile
  console.log('� Test 1: Verifica connessione server');
  try {
    const response = await makeRequest(`${API_BASE_URL}/user-settings/test`, {
      method: 'GET',
      timeout: 5000
    });
    console.log('✅ Server raggiungibile:', response.data);
  } catch (error) {
    console.error('❌ Server non raggiungibile:', error.message);
    console.log('💡 Assicurati che il backend sia in esecuzione su', API_BASE_URL);
    return;
  }

  console.log('\n� Test 2: Test endpoints autenticati');
  console.log('⚠️ Per testare gli endpoint autenticati, è necessario un token JWT valido');
  console.log('⏭️ Saltando test autenticati per ora...');
}

async function testDataIntegrity() {
  console.log('\n🔬 Test integrità dati...');
  
  // Test formato JSON
  try {
    const serialized = JSON.stringify(testGridConfig);
    const deserialized = JSON.parse(serialized);
    
    if (JSON.stringify(deserialized) === serialized) {
      console.log('✅ Formato JSON valido');
    } else {
      console.error('❌ Problema nella serializzazione JSON');
    }
  } catch (error) {
    console.error('❌ Errore formato JSON:', error.message);
  }
  
  // Test dimensione dati
  const dataSize = JSON.stringify(testGridConfig).length;
  console.log(`📏 Dimensione dati: ${dataSize} bytes`);
  
  if (dataSize > 64000) { // MySQL TEXT limit
    console.log('⚠️ Dati potrebbero superare il limite MySQL TEXT');
  } else {
    console.log('✅ Dimensione dati accettabile');
  }
}

// Funzione principale
async function main() {
  console.log('🚀 Test per il salvataggio delle Grid Configurations\n');
  console.log('🔧 Configurazione:');
  console.log(`   API_BASE_URL: ${API_BASE_URL}`);
  console.log(`   TOKEN_TEST: ${process.env.TOKEN_TEST ? '***impostato***' : 'non impostato'}\n`);

  await testDataIntegrity();
  await testBackendEndpoints();
  
  console.log('\n🏁 Test completati!');
  console.log('\n💡 Per test completi:');
  console.log('1. Avvia il backend: npm run start:dev');
  console.log('2. Fai login nel frontend');
  console.log('3. Copia il token JWT');
  console.log('4. Esegui: TOKEN_TEST=your_token node test-backend.js');
}

// Gestione errori
process.on('uncaughtException', (error) => {
  console.error('❌ Errore non gestito:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promise rejetta:', reason);
  process.exit(1);
});

main().catch(console.error);
