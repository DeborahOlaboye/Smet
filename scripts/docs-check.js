const fs = require('fs');
const toc = fs.readFileSync('docs/TOC.md', 'utf8');
if (!toc.includes('Developer Onboarding') || !toc.includes('Onboarding Checklist')) {
  console.error('Docs TOC missing onboarding entries');
  process.exit(2);
}
// User docs checks
if (!toc.includes('User documentation') || !toc.includes('User guide: Wallets')) {
  console.error('Docs TOC missing user documentation entries');
  process.exit(2);
}
// Technical docs checks
if (!toc.includes('Technical Specification') || !toc.includes('Architecture Overview')) {
  console.error('Docs TOC missing technical documentation entries');
  process.exit(2);
}
console.log('Docs TOC has onboarding, user and technical documentation entries');
