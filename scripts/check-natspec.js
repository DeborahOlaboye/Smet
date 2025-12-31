const fs = require('fs');
const path = require('path');

const CONTRACTS_DIR = path.join(__dirname, '..', 'contract', 'contracts');

function readFiles(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.sol'));
}

function checkFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const lines = src.split(/\r?\n/);
  const issues = [];

  function hasNatSpecAbove(idx) {
    // Look up to 5 lines above for a comment start '/**' or '///' or '@notice'/'@dev'
    for (let i = idx - 1; i >= Math.max(0, idx - 6); i--) {
      const l = lines[i].trim();
      if (l.startsWith('/**') || l.startsWith('///')) return true;
      if (l.includes('@notice') || l.includes('@dev') || l.includes('@title')) return true;
    }
    return false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // check events
    if (/\bevent\b/.test(line)) {
      if (!hasNatSpecAbove(i)) {
        issues.push({ line: i + 1, type: 'event', text: line.trim() });
      }
    }

    // check public/external functions
    if (/function\s+\w+\s*\(.*\)\s*(public|external)/.test(line)) {
      if (!hasNatSpecAbove(i)) {
        issues.push({ line: i + 1, type: 'function', text: line.trim() });
      }
    }

    // check public state variables
    if (/\b(public|external)\b/.test(line) && /;/.test(line) && !/function/.test(line)) {
      if (!hasNatSpecAbove(i)) {
        issues.push({ line: i + 1, type: 'variable', text: line.trim() });
      }
    }
  }

  return issues;
}

function main() {
  const files = readFiles(CONTRACTS_DIR);
  let totalIssues = 0;
  files.forEach(f => {
    const p = path.join(CONTRACTS_DIR, f);
    const issues = checkFile(p);
    if (issues.length) {
      console.log(`\nFile: ${f}`);
      issues.forEach(it => {
        console.log(`  [${it.type}] Line ${it.line}: ${it.text}`);
      });
    }
    totalIssues += issues.length;
  });

  if (totalIssues > 0) {
    console.error(`\nNatSpec issues found: ${totalIssues}`);
    process.exit(2);
  }
  console.log('All checks passed: NatSpec present for events/functions/public vars');
}

if (require.main === module) main();
