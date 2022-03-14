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
  nasm();
  console.log('=== ld ===');
  ld();
  console.log('=== execute ===');
  require('child_process').execSync('./disco_test', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}

function nasm() {
  if(process.platform === 'darwin') {
    require('child_process').execSync('nasm -f macho64 disco_test.asm -o disco_test.o', { stdio: 'inherit' });
  } else {
    require('child_process').execSync('nasm -f elf64 disco_test.asm -o disco_test.o', { stdio: 'inherit' });
  }
}

function ld() {
  if(process.platform === 'darwin') {
    require('child_process').execSync([
      'ld', 'disco_test.o',
      '-o', 'disco_test',
      '-macosx_version_min', '11.0',
      '-L', '/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/lib',
      '-lSystem'
    ].join(' '), {
      stdio: 'inherit'
    });
  } else {
    require('child_process').execSync('ld disco_test.o -o disco_test', { stdio: 'inherit' });
  }
}