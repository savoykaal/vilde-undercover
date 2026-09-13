import { runEngineTests } from './engine-tests.js';
import { runContentTests } from './content-tests.js';
import { runVaultTests } from './vault-tests.js';

const results = [...runEngineTests(), ...runContentTests(), ...runVaultTests()];
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : `\n      ${r.error}`}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;
