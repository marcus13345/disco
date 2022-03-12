#!/usr/bin/env node

// const AST = require('../ast.js');
// const compile = require('../compiler.js');

import { readFileSync } from "fs";
import { compile } from "./compiler";
import grammar, { $Newline } from "./grammar";
import { tokenize } from "./tokenizer";

console.log();
console.log('=== Original ===');
const fileContents = readFileSync('./disco.disco').toString('utf-8');
console.log(fileContents)

console.log('=== Tokenization ===');
const tokens = tokenize(fileContents);
for(const token of tokens) {
  process.stdout.write(token.toString() + '  ');
  if(token instanceof $Newline) console.log();
}

console.log();
console.log('=== Parsing ===');

const ast = grammar.solveFor(tokens)[0];

console.log();
console.log('=== AST ===');
console.dir(ast, {
  depth: Infinity
});

const asmFile = compile(ast)

try {
  console.log();
  console.log('=== ASM ===');
  console.log(asmFile);
  require('fs').writeFileSync('disco_test.asm', asmFile);

  console.log();
  console.log('=== nasm ===');
  require('child_process').execSync('nasm -f elf64 disco_test.asm -o disco_test.o', { stdio: 'inherit' });
  console.log('=== ld ===');
  require('child_process').execSync('ld disco_test.o -o disco_test', { stdio: 'inherit' });
  console.log('=== execute ===');
  require('child_process').execSync('./disco_test', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
