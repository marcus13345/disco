#!/usr/bin/env node

const AST = {
  Body(statements) { return { type: 'body', value: statements } },
  Identifier(name) { return { type: 'iden', value: name } },
  Link(identifier) { return { type: 'link', value: identifier } },
  Const(name, value) { return { type: 'const', name, value } },
  Int(n) { return { type: 'int', value: n } },
  String(s) { return { type: 'string', value: s } },
  Invocation(identifier, ...args) { return { type: 'invo', value: identifier, args } }
}

const linkables = {
  log: {
    asmName: '_log',
    asm: `\
  push rax
  mov rbx, 0
_log_loop:
  mov cl, [rax]
  cmp cl, 0
  je _log_loop_end
  inc rax
  inc rbx
  jmp _log_loop
_log_loop_end:
  mov rdx, rbx
  mov rax, 1
  mov rdi, 1
  pop rsi
  syscall
  ret`
  }
}

function compile(body) {
  const linkedFunctions = {}

  // add linked functions
  // add static literals
  // add main statments
  const rname = () => (new Array(8).fill('')).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]).join('');
  const literals = {

  }
  let mainStatements = '';

  const parseLink = (identifier) => {
    console.assert(identifier.type === 'iden', 'EXPECTED IDENTIFIER AFTER LINK');
    console.assert(identifier.value in linkables, 'CANNOT FIND LINK ' + identifier.value);
    linkedFunctions[identifier.value] = linkables[identifier.value];
  }

  const parseString = (string) => {
    const name = rname();
    literals[name] = string.value
    return name;
  }

  const parseInvocation = (invocation) => {
    console.assert(invocation.value.value in linkedFunctions, 'UNKNOWN FUNCTION ' + invocation.value);
    
    const stuffIdk = [];

    for(const arg of invocation.args) {
      switch(arg.type) {
        case 'string': {
          const asmName = parseString(arg);
          stuffIdk.push(asmName);
          break;
        }
      }
    }

    mainStatements += `\
  mov rax, ${stuffIdk[0]}
  call ${linkedFunctions[invocation.value.value].asmName}
`

  }

  const parseBody = (body) => {
    for(const node of body.value) {
      switch(node.type) {
        case 'link': {
          parseLink(node.value);
          break;
        }
        case 'invo': {
          parseInvocation(node);
          break;
        }
      }
    }
  }

  parseBody(body);

  return `\
section .data
${Object.entries(literals).map(([name, string]) => {
  return "  " + name + " db \"" + string + "\",10,0";
})}
section .text
  global _start

_start:
${mainStatements}
  call _exit

_exit:
  mov rax, 60
  mov rdi, 0
  syscall

${Object.values(linkedFunctions).map(({asmName, asm}) => {
  return `${asmName}:\n${asm}`
}).join('\n\n')}`
}


require('fs').writeFileSync('out.asm', compile(AST.Body([
  AST.Link(AST.Identifier('log')),
  AST.Invocation(
    AST.Identifier('log'),
    AST.String('Hello World')
  )
])));


try {
  require('child_process').execSync('nasm -f elf64 out.asm -o out.o');
  require('child_process').execSync('ld out.o -o out');
  require('child_process').execSync('./out', { stdio: 'inherit' });
} catch (e) {

}



