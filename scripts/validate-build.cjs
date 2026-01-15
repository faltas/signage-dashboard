#!/usr/bin/env node
// scripts/validate-build.cjs - Pre-deployment validation

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  BOLD: '\x1b[1m'
};

function log(msg, color = COLORS.RESET) {
  console.log(`${color}${msg}${COLORS.RESET}`);
}

function header(msg) {
  console.log(`\n${COLORS.CYAN}${COLORS.BOLD}${'='.repeat(60)}`);
  console.log(msg);
  console.log(`${'='.repeat(60)}${COLORS.RESET}\n`);
}

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(name, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    log(`✓ ${name}`, COLORS.GREEN);
  } catch (err) {
    failedChecks++;
    log(`✗ ${name}`, COLORS.RED);
    log(`  Error: ${err.message}`, COLORS.RED);
  }
}

header('🔍 Digital Signage Player - Pre-Deployment Validation');

// 1. Dependency Check
header('📦 Dependencies');

check('node_modules exists', () => {
  if (!fs.existsSync(path.join(__dirname, '../node_modules'))) {
    throw new Error('node_modules not found. Run npm install');
  }
});

check('All required packages installed', () => {
  const pkg = require('../package.json');
  const required = ['electron', 'qrcode', '@supabase/supabase-js', 'node-fetch'];
  const missing = [];
  
  required.forEach(dep => {
    const inDeps = (pkg.dependencies && pkg.dependencies[dep]);
    const inDevDeps = (pkg.devDependencies && pkg.devDependencies[dep]);
    if (!inDeps && !inDevDeps) {
      missing.push(dep);
    }
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing packages: ${missing.join(', ')}`);
  }
});

// 2. File Structure
header('📁 File Structure');

const criticalFiles = [
  'main/main.cjs',
  'preload/preload.cjs',
  'preload/env.json',
  'renderer/index.html',
  'renderer/app.js',
  'renderer/core/PlayerEngine.js',
  'renderer/core/PlayerState.js',
  'renderer/services/DisplayManager.js',
  'renderer/services/PlaylistManager.js',
  'renderer/services/HealthManager.js',
  'renderer/services/CommandManager.js',
  'renderer/render/RenderEngine.js',
  'renderer/render/components/ScreenComponents.js',
  'package.json',
  'electron-builder.yml'
];

criticalFiles.forEach(file => {
  check(`${file} exists`, () => {
    if (!fs.existsSync(path.join(__dirname, '..', file))) {
      throw new Error(`File not found: ${file}`);
    }
  });
});

// 3. Configuration Validation
header('⚙️ Configuration');

check('env.json is valid JSON', () => {
  const envPath = path.join(__dirname, '../preload/env.json');
  const content = fs.readFileSync(envPath, 'utf8');
  JSON.parse(content);
});

check('env.json has required keys', () => {
  const env = require('../preload/env.json');
  const required = ['BACKEND_URL', 'SUPABASE_LINK', 'ANON_KEY', 'HEARBEAT_MS'];
  const missing = required.filter(key => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing env keys: ${missing.join(', ')}`);
  }
});

check('package.json is valid', () => {
  const pkg = require('../package.json');
  if (!pkg.name || !pkg.version || !pkg.main) {
    throw new Error('package.json missing required fields');
  }
});

// 4. Code Quality
header('🐛 Code Quality');

check('No syntax errors in main process', () => {
  try {
    require('../main/main.cjs');
  } catch (err) {
    if (err.message.includes('Unexpected token')) {
      throw new Error('Syntax error detected');
    }
    // Other errors (like require electron) are ok for validation
  }
});

check('No duplicate screen components', () => {
  const oldPairing = path.join(__dirname, '../renderer/render/components/PairingScreen.js');
  const oldWaiting = path.join(__dirname, '../renderer/render/components/WaitingScreen.js');
  
  if (fs.existsSync(oldPairing) || fs.existsSync(oldWaiting)) {
    throw new Error('Old duplicate screen component files still exist');
  }
});

check('index.html has correct root element', () => {
  const html = fs.readFileSync(path.join(__dirname, '../renderer/index.html'), 'utf8');
  if (!html.includes('id="root"')) {
    throw new Error('index.html missing id="root"');
  }
  if (html.includes('id="players"')) {
    throw new Error('index.html still has old id="players"');
  }
});

// 5. Run Test Suite
header('🧪 Automated Tests');

check('Main test suite passes', () => {
  try {
    execSync('node tests/run-tests.cjs', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
  } catch (err) {
    throw new Error('Test suite failed');
  }
});

check('Pairing test suite passes', () => {
  try {
    execSync('node tests/pairing-test.cjs', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
  } catch (err) {
    throw new Error('Pairing tests failed');
  }
});

// 6. Build Readiness
header('📦 Build Readiness');

check('electron-builder config exists', () => {
  if (!fs.existsSync(path.join(__dirname, '../electron-builder.yml'))) {
    throw new Error('electron-builder.yml not found');
  }
});

check('README.md is comprehensive', () => {
  const readme = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8');
  if (readme.length < 1000) {
    throw new Error('README.md seems incomplete (< 1000 chars)');
  }
});

// Summary
header('📊 Validation Summary');

log(`Total Checks: ${totalChecks}`);
log(`Passed: ${passedChecks}`, COLORS.GREEN);
log(`Failed: ${failedChecks}`, failedChecks > 0 ? COLORS.RED : COLORS.GREEN);

const percentage = ((passedChecks / totalChecks) * 100).toFixed(1);
log(`\nSuccess Rate: ${percentage}%\n`);

if (failedChecks === 0) {
  log('✓ ALL VALIDATIONS PASSED - READY FOR BUILD! 🚀', COLORS.GREEN + COLORS.BOLD);
  log('\nYou can now run: npm run build\n', COLORS.CYAN);
  process.exit(0);
} else {
  log('✗ VALIDATION FAILED - FIX ISSUES BEFORE BUILDING', COLORS.RED + COLORS.BOLD);
  log('\nPlease fix the issues above before deployment.\n', COLORS.YELLOW);
  process.exit(1);
}