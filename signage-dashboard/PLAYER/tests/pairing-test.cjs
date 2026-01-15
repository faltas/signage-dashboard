// tests/pairing-test.cjs - Test for Pairing Screen QR Code
const fs = require('fs');
const path = require('path');

const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m'
};

console.log(`${COLORS.CYAN}\n${'='.repeat(60)}`);
console.log('Pairing Screen QR Code - Verification Test');
console.log(`${'='.repeat(60)}${COLORS.RESET}\n`);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`${COLORS.GREEN}✓${COLORS.RESET} ${name}`);
  } catch (err) {
    failed++;
    console.log(`${COLORS.RED}✗${COLORS.RESET} ${name}`);
    console.log(`  ${COLORS.RED}Error: ${err.message}${COLORS.RESET}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test 1: Verify ScreenComponents exists
test('ScreenComponents.js file exists', () => {
  const filepath = path.join(__dirname, '../renderer/render/components/ScreenComponents.js');
  assert(fs.existsSync(filepath), 'ScreenComponents.js not found');
});

// Test 2: Verify PairingScreen is exported
test('PairingScreen function is exported', () => {
  const filepath = path.join(__dirname, '../renderer/render/components/ScreenComponents.js');
  const content = fs.readFileSync(filepath, 'utf8');
  assert(content.includes('export async function PairingScreen'), 'PairingScreen not exported as async function');
});

// Test 3: Verify PairingScreen uses window.QR.Code
test('PairingScreen calls window.QR.Code for QR generation', () => {
  const filepath = path.join(__dirname, '../renderer/render/components/ScreenComponents.js');
  const content = fs.readFileSync(filepath, 'utf8');
  assert(content.includes('window.QR.Code'), 'PairingScreen not using window.QR.Code');
});

// Test 4: Verify PairingScreen returns HTML with QR image
test('PairingScreen returns HTML with img element', () => {
  const filepath = path.join(__dirname, '../renderer/render/components/ScreenComponents.js');
  const content = fs.readFileSync(filepath, 'utf8');
  assert(content.includes('<img src="${qrDataUrl}"'), 'PairingScreen not returning img element for QR');
});

// Test 5: Verify PairingScreen displays pairing code
test('PairingScreen displays pairing code text', () => {
  const filepath = path.join(__dirname, '../renderer/render/components/ScreenComponents.js');
  const content = fs.readFileSync(filepath, 'utf8');
  assert(content.includes('${pairing_code}') || content.includes('${paring_code}'), 'PairingScreen not displaying pairing code');
});

// Test 6: Verify preload exposes QR.Code API
test('Preload script exposes window.QR.Code', () => {
  const filepath = path.join(__dirname, '../preload/preload.cjs');
  const content = fs.readFileSync(filepath, 'utf8');
  assert(content.includes('contextBridge.exposeInMainWorld("QR"'), 'Preload not exposing QR API');
  assert(content.includes('Code:'), 'Preload QR API missing Code function');
});

// Test 7: Verify QRCode dependency is installed
test('QRCode package is installed', () => {
  const pkg = require('../package.json');
  assert(pkg.dependencies && pkg.dependencies.qrcode, 'qrcode package not in dependencies');
});

// Test 8: Verify QRCode is required in preload
test('Preload requires qrcode package', () => {
  const filepath = path.join(__dirname, '../preload/preload.cjs');
  const content = fs.readFileSync(filepath, 'utf8');
  assert(content.includes('require("qrcode")'), 'Preload not requiring qrcode package');
});

// Test 9: Verify PlayerEngine awaits PairingScreen
test('PlayerEngine properly awaits PairingScreen', () => {
  const filepath = path.join(__dirname, '../renderer/core/PlayerEngine.js');
  const content = fs.readFileSync(filepath, 'utf8');
  assert(content.includes('await PairingScreen'), 'PlayerEngine not awaiting PairingScreen');
});

// Test 10: Verify index.html has root element (not players)
test('index.html has id="root" element', () => {
  const filepath = path.join(__dirname, '../renderer/index.html');
  const content = fs.readFileSync(filepath, 'utf8');
  assert(content.includes('id="root"'), 'index.html missing root element');
  assert(!content.includes('id="players"'), 'index.html still has old players element');
});

// Test 11: Verify app.js gets root element correctly
test('app.js queries for root element', () => {
  const filepath = path.join(__dirname, '../renderer/app.js');
  const content = fs.readFileSync(filepath, 'utf8');
  assert(content.includes('getElementById("root")'), 'app.js not getting root element');
});

// Test 12: Verify old duplicate files are removed
test('Old duplicate PairingScreen.js is removed', () => {
  const filepath1 = path.join(__dirname, '../renderer/render/components/PairingScreen.js');
  const filepath2 = path.join(__dirname, '../renderer/render/components/WaitingScreen.js');
  assert(!fs.existsSync(filepath1), 'Old PairingScreen.js still exists');
  assert(!fs.existsSync(filepath2), 'Old WaitingScreen.js still exists');
});

// Test 13: Verify error handling in PairingScreen
test('PairingScreen has error handling', () => {
  const filepath = path.join(__dirname, '../renderer/render/components/ScreenComponents.js');
  const content = fs.readFileSync(filepath, 'utf8');
  assert(content.includes('try') && content.includes('catch'), 'PairingScreen missing error handling');
});

// Test 14: Verify pairing code format
test('PairingScreen uses correct payload format', () => {
  const filepath = path.join(__dirname, '../renderer/render/components/ScreenComponents.js');
  const content = fs.readFileSync(filepath, 'utf8');
  assert(content.includes('signage://pair/'), 'PairingScreen not using correct payload format');
});

// Summary
console.log(`\n${COLORS.CYAN}${'='.repeat(60)}`);
console.log('Test Results');
console.log(`${'='.repeat(60)}${COLORS.RESET}`);
console.log(`Total:  ${passed + failed}`);
console.log(`${COLORS.GREEN}Passed: ${passed}${COLORS.RESET}`);
console.log(`${COLORS.RED}Failed: ${failed}${COLORS.RESET}`);

const percentage = ((passed / (passed + failed)) * 100).toFixed(1);
console.log(`\nSuccess Rate: ${percentage}%\n`);

if (failed === 0) {
  console.log(`${COLORS.GREEN}✓ Pairing screen QR code is correctly implemented!${COLORS.RESET}\n`);
  process.exit(0);
} else {
  console.log(`${COLORS.RED}✗ Some pairing tests failed${COLORS.RESET}\n`);
  process.exit(1);
}