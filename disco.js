#!/usr/bin/env node

const AST = require('./ast.js');
const compile = require('./compiler.js');

const myProgram = AST.Body([
  AST.Variable('test1', AST.String('This String is Contained in a variable')),
  AST.Variable('test2', AST.String('This is a second string in a variable')),
  AST.Link('log'),
  AST.Invocation('log', AST.String('hello')),
  AST.Invocation('log', AST.String('world')),
  AST.Invocation('log', AST.VariableReference('test1')),
  AST.Invocation('log', AST.VariableReference('test2')),
  AST.Invocation('log', AST.VariableReference('test1')),
  AST.Invocation('log', AST.VariableReference('test2')),
]);

const asmFile = compile(myProgram)
try {
  require('fs').writeFileSync('out.asm', asmFile);
  require('child_process').execSync('nasm -f elf64 out.asm -o out.o', { stdio: 'inherit' });
  require('child_process').execSync('ld out.o -o out', { stdio: 'inherit' });
  require('child_process').execSync('./out', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}
