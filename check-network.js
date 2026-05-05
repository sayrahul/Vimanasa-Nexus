// Quick network diagnostic script
const https = require('https');
const dns = require('dns');

console.log('🔍 Network Diagnostic Tool\n');

// Test 1: DNS Resolution
console.log('1️⃣ Testing DNS resolution...');
dns.resolve4('oauth2.googleapis.com', (err, addresses) => {
  if (err) {
    console.log('❌ DNS Resolution Failed:', err.code);
    console.log('   This means your system cannot find Google\'s servers');
    console.log('   Possible causes:');
    console.log('   - No internet connection');
    console.log('   - DNS server issues');
    console.log('   - Firewall blocking DNS');
  } else {
    console.log('✅ DNS Resolution Successful');
    console.log('   IP Addresses:', addresses.join(', '));
  }
  
  // Test 2: HTTPS Connection
  console.log('\n2️⃣ Testing HTTPS connection...');
  const req = https.get('https://www.googleapis.com/', (res) => {
    console.log('✅ HTTPS Connection Successful');
    console.log('   Status Code:', res.statusCode);
    console.log('   Headers:', Object.keys(res.headers).length, 'headers received');
  });
  
  req.on('error', (err) => {
    console.log('❌ HTTPS Connection Failed:', err.code);
    console.log('   Possible causes:');
    console.log('   - Firewall blocking HTTPS');
    console.log('   - Proxy configuration needed');
    console.log('   - VPN interference');
  });
  
  req.setTimeout(5000, () => {
    console.log('❌ Connection Timeout (5 seconds)');
    req.destroy();
  });
});

// Test 3: Check Proxy Settings
console.log('\n3️⃣ Checking proxy settings...');
console.log('   HTTP_PROXY:', process.env.HTTP_PROXY || 'Not set');
console.log('   HTTPS_PROXY:', process.env.HTTPS_PROXY || 'Not set');
console.log('   NO_PROXY:', process.env.NO_PROXY || 'Not set');

// Test 4: System Info
console.log('\n4️⃣ System Information:');
console.log('   Node Version:', process.version);
console.log('   Platform:', process.platform);
console.log('   Architecture:', process.arch);

setTimeout(() => {
  console.log('\n✅ Diagnostic complete!');
  console.log('\n💡 Recommendations:');
  console.log('   1. If DNS fails: Check internet connection');
  console.log('   2. If HTTPS fails: Check firewall/antivirus settings');
  console.log('   3. If timeout: Network is slow, retries should help');
  console.log('   4. If all pass: The issue is intermittent, retries will handle it');
}, 3000);
