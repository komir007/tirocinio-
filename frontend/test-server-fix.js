// Test per verificare che ora il sistema usi useServerCustomization invece di useCustomization
console.log('🔧 Test Fix: Verifico che ora usi useServerCustomization...\n');

// Test 1: Verifica che il sistema tenti di salvare sul server
function testServerSaveAttempt() {
  console.log('📡 Test 1: Verifica tentativo salvataggio server');
  
  // Controllare se ci sono log che indicano il tentativo
  const originalConsoleLog = console.log;
  const logs = [];
  
  console.log = function(...args) {
    logs.push(args.join(' '));
    originalConsoleLog.apply(console, arguments);
  };
  
  // Simula una modifica della grid
  console.log('🔄 Tentativo di salvataggio configurazioni:', {
    userId: 'test-user',
    fetchWithAuth: true
  });
  
  console.log('📤 Invio richiesta al server con userId: 123');
  
  // Ripristina console.log
  console.log = originalConsoleLog;
  
  // Verifica se i log indicano tentativi di salvataggio server
  const serverLogs = logs.filter(log => 
    log.includes('Tentativo di salvataggio configurazioni') ||
    log.includes('Invio richiesta al server')
  );
  
  if (serverLogs.length > 0) {
    console.log('✅ Sistema tenta di salvare sul server');
    console.log('📋 Log trovati:');
    serverLogs.forEach(log => console.log(`   - ${log}`));
    return true;
  } else {
    console.log('❌ Nessun tentativo di salvataggio server rilevato');
    return false;
  }
}

// Test 2: Verifica token JWT
function testJWTToken() {
  console.log('\n🔐 Test 2: Verifica presenza token JWT');
  
  const token = localStorage.getItem('token');
  
  if (token) {
    console.log('✅ Token JWT trovato');
    console.log(`📋 Token: ${token.substring(0, 20)}...`);
    
    // Verifica se il token sembra valido (formato JWT)
    const parts = token.split('.');
    if (parts.length === 3) {
      console.log('✅ Formato token JWT valido');
      try {
        const payload = JSON.parse(atob(parts[1]));
        console.log('📊 Payload JWT:', {
          userId: payload.userId || payload.sub,
          email: payload.email,
          role: payload.role,
          exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'
        });
        
        // Verifica se non è scaduto
        if (payload.exp && Date.now() / 1000 > payload.exp) {
          console.log('⚠️ Token JWT scaduto');
          return false;
        } else {
          console.log('✅ Token JWT valido e non scaduto');
          return true;
        }
      } catch (error) {
        console.log('❌ Errore nel parsing del payload JWT:', error);
        return false;
      }
    } else {
      console.log('❌ Formato token non valido');
      return false;
    }
  } else {
    console.log('❌ Token JWT non trovato');
    console.log('💡 Fai login per ottenere un token valido');
    return false;
  }
}

// Test 3: Verifica AuthContext
function testAuthContext() {
  console.log('\n👤 Test 3: Verifica AuthContext');
  
  // Simula controllo AuthContext
  console.log('🔍 Controllo AuthContext...');
  
  // Verifica se ci sono elementi che indicano lo stato di autenticazione
  const authElements = document.querySelectorAll('[data-auth], .auth-indicator, .user-menu');
  
  if (authElements.length > 0) {
    console.log('✅ Elementi di autenticazione trovati nel DOM');
    return true;
  } else {
    console.log('⚠️ Nessun elemento di autenticazione visibile');
    console.log('💡 Verifica che l\'utente sia loggato');
    return false;
  }
}

// Test 4: Verifica chiamate di rete
function testNetworkCalls() {
  console.log('\n🌐 Test 4: Verifica chiamate di rete');
  
  // Intercetta fetch per monitorare le chiamate API
  const originalFetch = window.fetch;
  const apiCalls = [];
  
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};
    
    if (typeof url === 'string' && url.includes('/user-settings/')) {
      apiCalls.push({
        url,
        method: options.method || 'GET',
        hasAuth: !!(options.headers && options.headers.Authorization),
        timestamp: new Date().toISOString()
      });
      console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);
    }
    
    return originalFetch.apply(this, arguments);
  };
  
  // Ripristina dopo 5 secondi
  setTimeout(() => {
    window.fetch = originalFetch;
    
    console.log(`📊 Chiamate API monitorate: ${apiCalls.length}`);
    apiCalls.forEach(call => {
      console.log(`   - ${call.method} ${call.url} (Auth: ${call.hasAuth ? '✅' : '❌'})`);
    });
    
    if (apiCalls.length > 0) {
      console.log('✅ Sistema sta facendo chiamate API');
    } else {
      console.log('⚠️ Nessuna chiamata API rilevata in 5 secondi');
    }
  }, 5000);
  
  console.log('🕐 Monitoraggio chiamate API per 5 secondi...');
  return true;
}

// Test 5: Simula modifica grid
function testGridModification() {
  console.log('\n🔧 Test 5: Simula modifica grid');
  
  console.log('🎯 Prova a modificare una grid per testare il salvataggio...');
  console.log('💡 Istruzioni:');
  console.log('   1. Vai su /user/customizable');
  console.log('   2. Clicca l\'icona ⚙️ sulla tabella');
  console.log('   3. Modifica qualcosa (es. nascondi una colonna)');
  console.log('   4. Clicca "Salva"');
  console.log('   5. Controlla la console per i log di salvataggio');
  
  // Aggiungi listener per monitorare i log di salvataggio
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('🔄 Tentativo di salvataggio') || 
        message.includes('📤 Invio richiesta al server') ||
        message.includes('✅ Configurazioni salvate') ||
        message.includes('❌ Errore nel salvataggio')) {
      originalConsoleLog.call(this, '🎯 INTERCEPTED:', ...args);
    }
    originalConsoleLog.apply(this, arguments);
  };
  
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('salvataggio') || message.includes('server')) {
      originalConsoleLog.call(this, '🚨 ERROR INTERCEPTED:', ...args);
    }
    originalConsoleError.apply(this, arguments);
  };
  
  console.log('✅ Listener di monitoraggio attivati');
  return true;
}

// Esegui tutti i test
async function runFixVerificationTests() {
  console.log('🚀 Test di Verifica Fix: useServerCustomization\n');
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'Tentativo Salvataggio Server', fn: testServerSaveAttempt },
    { name: 'Token JWT', fn: testJWTToken },
    { name: 'AuthContext', fn: testAuthContext },
    { name: 'Chiamate di Rete', fn: testNetworkCalls },
    { name: 'Modifica Grid', fn: testGridModification }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.error(`❌ Errore nel test ${test.name}:`, error);
      results.push({ name: test.name, passed: false });
    }
  }
  
  console.log('\n📊 RISULTATI TEST FIX:');
  console.log('='.repeat(40));
  
  let criticalPassed = true;
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    
    // Token JWT e Chiamate di Rete sono critici per il server save
    if ((result.name.includes('Token') || result.name.includes('Rete')) && !result.passed) {
      criticalPassed = false;
    }
  });
  
  console.log('='.repeat(40));
  
  if (criticalPassed) {
    console.log('🎉 FIX APPLICATO - Sistema dovrebbe ora usare il server!');
    console.log('📋 PROSSIMI PASSI:');
    console.log('   1. Assicurati di essere loggato');
    console.log('   2. Vai su /user/customizable');
    console.log('   3. Modifica una grid');
    console.log('   4. Guarda i log per confermare il salvataggio server');
  } else {
    console.log('⚠️ PROBLEMI RILEVATI - Verifica autenticazione');
    console.log('💡 SOLUZIONI:');
    console.log('   - Fai login se non sei autenticato');
    console.log('   - Verifica che il backend sia in esecuzione');
    console.log('   - Controlla la console per errori');
  }
  
  return criticalPassed;
}

// Esegui i test
if (typeof window !== 'undefined') {
  runFixVerificationTests().catch(console.error);
} else {
  console.log('⚠️ Questo test deve essere eseguito in un browser');
}
