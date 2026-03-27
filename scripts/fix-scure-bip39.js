// Fix typo in @scure/bip39@2.0.1 package.json exports map
// "traditional-chinesejss" should be "traditional-chinese.js"
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'node_modules', '@scure', 'bip39', 'package.json');

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const key = './wordlists/traditional-chinese.js';
  if (pkg.exports && pkg.exports[key] === './wordlists/traditional-chinesejss') {
    pkg.exports[key] = './wordlists/traditional-chinese.js';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('Fixed @scure/bip39 traditional-chinese exports typo');
  }
} catch (e) {
  // Silently ignore if package not installed yet
}
