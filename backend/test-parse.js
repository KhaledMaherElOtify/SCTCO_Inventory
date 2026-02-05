import fs from 'fs';

const sql = fs.readFileSync('./sql/schema.sql', 'utf8');
const parts = sql.split(';');

console.log(`Total parts after split: ${parts.length}\n`);

// Show parts that are CREATE TABLE
parts.forEach((part, i) => {
  const trimmed = part.trim();
  if (trimmed.includes('CREATE TABLE')) {
    console.log(`Part ${i}: Contains CREATE TABLE - length ${trimmed.length}`);
    console.log(`First 80 chars: ${trimmed.substring(0, 80)}`);
    console.log('');
  }
});

// Now show what the filter does
const stmts = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`\nAfter filter: ${stmts.length} statements\n`);
stmts.slice(0, 5).forEach((s, i) => {
  console.log(`[${i+1}] ${s.substring(0, 60)}`);
});
