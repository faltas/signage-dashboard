// tests/run-tests.js - Professional Test Suite
const fs = require('fs');
const path = require('path');

const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m'
};

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, total: 0 };
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(`${COLORS.CYAN}\n${'='.repeat(60)}`);
    console.log('Digital Signage Player - Test Suite');
    console.log(`${'='.repeat(60)}${COLORS.RESET}\n`);

    for (const test of this.tests) {
      this.results.total++;
      try {
        await test.fn();
        this.results.passed++;
        console.log(`${COLORS.GREEN}✓${COLORS.RESET} ${test.name}`);
      } catch (err) {
        this.results.failed++;
        console.log(`${COLORS.RED}✗${COLORS.RESET} ${test.name}`);
        console.log(`  ${COLORS.RED}Error: ${err.message}${COLORS.RESET}`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log(`\n${COLORS.CYAN}${'='.repeat(60)}`);
    console.log('Test Results');
    console.log(`${'='.repeat(60)}${COLORS.RESET}`);
    console.log(`Total:  ${this.results.total}`);
    console.log(`${COLORS.GREEN}Passed: ${this.results.passed}${COLORS.RESET}`);
    console.log(`${COLORS.RED}Failed: ${this.results.failed}${COLORS.RESET}`);
    
    const percentage = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`\nSuccess Rate: ${percentage}%\n`);

    if (this.results.failed === 0) {
      console.log(`${COLORS.GREEN}✓ All tests passed!${COLORS.RESET}\n`);
      process.exit(0);
    } else {
      console.log(`${COLORS.RED}✗ Some tests failed${COLORS.RESET}\n`);
      process.exit(1);
    }
  }
}

const runner = new TestRunner();

// Helper functions
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function fileExists(filepath) {
  return fs.existsSync(filepath);
}

function isValidJSON(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    JSON.parse(content);
    return true;
  } catch (err) {
    return false;
  }
}

function hasRequiredExports(filepath, exports) {
  const content = fs.readFileSync(filepath, 'utf8');
  return exports.every(exp => content.includes(`export`) && content.includes(exp));
}

// Test Suite

// 1. Project Structure Tests
runner.test('Project root directory exists', () => {
  assert(fileExists(path.join(__dirname, '..')), 'Root directory not found');
});

runner.test('Main process file exists', () => {
  assert(fileExists(path.join(__dirname, '../main/main.cjs')), 'main.cjs not found');
});

runner.test('Preload script exists', () => {
  assert(fileExists(path.join(__dirname, '../preload/preload.cjs')), 'preload.cjs not found');
});

runner.test('Renderer app.js exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/app.js')), 'app.js not found');
});

runner.test('Renderer index.html exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/index.html')), 'index.html not found');
});

// 2. Configuration Tests
runner.test('package.json is valid', () => {
  assert(isValidJSON(path.join(__dirname, '../package.json')), 'package.json is invalid');
});

runner.test('package.json has required fields', () => {
  const pkg = require('../package.json');
  assert(pkg.name, 'package.json missing name');
  assert(pkg.version, 'package.json missing version');
  assert(pkg.main, 'package.json missing main entry');
  assert(pkg.dependencies, 'package.json missing dependencies');
});

runner.test('env.json is valid', () => {
  assert(isValidJSON(path.join(__dirname, '../preload/env.json')), 'env.json is invalid');
});

runner.test('env.json has required keys', () => {
  const env = require('../preload/env.json');
  assert(env.BACKEND_URL, 'env.json missing BACKEND_URL');
  assert(env.SUPABASE_LINK, 'env.json missing SUPABASE_LINK');
  assert(env.ANON_KEY, 'env.json missing ANON_KEY');
});

// 3. Core Module Tests
runner.test('PlayerEngine module exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/core/PlayerEngine.js')), 'PlayerEngine.js not found');
});

runner.test('PlayerEngine exports createPlayerEngine', () => {
  assert(
    hasRequiredExports(path.join(__dirname, '../renderer/core/PlayerEngine.js'), ['createPlayerEngine']),
    'PlayerEngine missing required exports'
  );
});

runner.test('PlayerState module exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/core/PlayerState.js')), 'PlayerState.js not found');
});

// 4. Service Manager Tests
runner.test('DisplayManager exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/services/DisplayManager.js')), 'DisplayManager.js not found');
});

runner.test('DisplayManager exports class', () => {
  assert(
    hasRequiredExports(path.join(__dirname, '../renderer/services/DisplayManager.js'), ['DisplayManager']),
    'DisplayManager missing class export'
  );
});

runner.test('PlaylistManager exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/services/PlaylistManager.js')), 'PlaylistManager.js not found');
});

runner.test('HealthManager exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/services/HealthManager.js')), 'HealthManager.js not found');
});

runner.test('CommandManager exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/services/CommandManager.js')), 'CommandManager.js not found');
});

// 5. Rendering Components Tests
runner.test('RenderEngine exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/render/RenderEngine.js')), 'RenderEngine.js not found');
});

runner.test('ScreenComponents exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/render/components/ScreenComponents.js')), 'ScreenComponents.js not found');
});

runner.test('ScreenComponents exports required functions', () => {
  assert(
    hasRequiredExports(
      path.join(__dirname, '../renderer/render/components/ScreenComponents.js'),
      ['PairingScreen', 'WaitingScreen', 'ErrorScreen']
    ),
    'ScreenComponents missing required exports'
  );
});

runner.test('ImageRenderer exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/render/components/ImageRenderer.js')), 'ImageRenderer.js not found');
});

runner.test('VideoRenderer exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/render/components/VideoRenderer.js')), 'VideoRenderer.js not found');
});

// 6. Cache and Offline Tests
runner.test('assetCache module exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/cache/assetCache.js')), 'assetCache.js not found');
});

runner.test('cacheService module exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/offline/cacheService.js')), 'cacheService.js not found');
});

runner.test('offlineGuard module exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/offline/offlineGuard.js')), 'offlineGuard.js not found');
});

// 7. Utils Tests
runner.test('logger module exists', () => {
  assert(fileExists(path.join(__dirname, '../renderer/utils/logger.js')), 'logger.js not found');
});

// 8. HTML Structure Tests
runner.test('index.html has root element', () => {
  const html = fs.readFileSync(path.join(__dirname, '../renderer/index.html'), 'utf8');
  assert(html.includes('id="root"'), 'index.html missing root element');
});

runner.test('index.html loads app.js module', () => {
  const html = fs.readFileSync(path.join(__dirname, '../renderer/index.html'), 'utf8');
  assert(html.includes('type="module"') && html.includes('app.js'), 'index.html not loading app.js as module');
});

// 9. Dependencies Tests
runner.test('All required dependencies installed', () => {
  const pkg = require('../package.json');
  const deps = Object.keys(pkg.dependencies || {});
  assert(deps.includes('qrcode'), 'Missing qrcode dependency');
  assert(deps.includes('@supabase/supabase-js'), 'Missing @supabase/supabase-js dependency');
});

runner.test('Electron is installed', () => {
  const pkg = require('../package.json');
  const devDeps = Object.keys(pkg.devDependencies || {});
  assert(devDeps.includes('electron'), 'Missing electron dev dependency');
});

// 10. Code Quality Tests
runner.test('No TODO comments in critical files', () => {
  const criticalFiles = [
    '../renderer/core/PlayerEngine.js',
    '../renderer/app.js',
    '../preload/preload.cjs'
  ];
  
  for (const file of criticalFiles) {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    assert(!content.includes('TODO'), `${file} contains TODO comments`);
  }
});

runner.test('All manager classes have constructor', () => {
  const managers = [
    '../renderer/services/DisplayManager.js',
    '../renderer/services/PlaylistManager.js',
    '../renderer/services/HealthManager.js',
    '../renderer/services/CommandManager.js'
  ];
  
  for (const manager of managers) {
    const content = fs.readFileSync(path.join(__dirname, manager), 'utf8');
    assert(content.includes('constructor'), `${manager} missing constructor`);
  }
});

// Run all tests
runner.run().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});