
const rname = () => (new Array(8).fill(''))
  .map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[
    Math.floor(Math.random() * 26)
  ]).join('');

const linkables = {
  log: require('./linkables/log.js'),
  exit: require('./linkables/exit.js')
};

const callingConvention = {
  SYSCALL_REGISTER: 'rax',
  PARAMETER_REGISTERS: ['rdi', 'rsi', 'rdx', 'rcx', 'r8', 'r9']
}

const staticVariables = new Map();
const linkedLibraries = new Map();
const statements = [];
// this maybe should be absctracted into scopes but /shrug
const localVariables = new Map();

const sections = {
  data() {
    const convert = ([name, xs]) => name + ' db ' + xs.join(',')
    return 'section .data\n  '
      + [...staticVariables.entries()]
        .map(convert)
        .join('\n  ')
  },
  text() {
    return 'section .text\n  global _start\n_start:\n  push rbp\n  mov rbp, rsp\n  '
      + statements.join('\n  ')
      + '\n  mov rsp, rbp\n  pop rbp\n  mov rax, 60\n  mov rdi, 0\n  syscall\n'
      + [...linkedLibraries.values()].map(({asmName, asm}) => asmName + ':\n' + asm).join('\n')
  }
}

function zip(a, b) {
  const len = Math.min(a.length, b.length);
  const ret = [];
  for(let i = 0; i < len; i ++) {
    ret.push([a[i], b[i]]);
  }
  return ret;
}

function compileStringLiteral(str) {
  const varName = rname();
  staticVariables.set(varName, Buffer.from(str + '\x00'));
  return varName;
}

function compileRef(name) {
  console.assert(localVariables.has(name), 'unknown variable ' + name);
  return `[rbp - ${localVariables.get(name).offset}]`;
}

function compileInvocation(name, ...args) {
  console.assert(linkedLibraries.has(name), 'unknown function ' + name);
  console.assert(args.length <= 6, 'functions cannot have more than 6 arguments');
  const argMoves = [];
  for(const [register, argument] of zip(callingConvention.PARAMETER_REGISTERS, args)) {
    if(typeof argument === 'object') {
      switch (argument.type) {
        case 'string': {
          argMoves.push(`mov ${register}, ${compileStringLiteral(argument.value)}`)
          break;
        }
        case 'ref': {
          const reference = compileRef(argument.value);
          argMoves.push(`mov ${register}, ${reference}`)
          break;
        }
        default: {
          console.error('unhandled argument type ' + argument.type);
        }
      }
    }
  }
  statements.push(...argMoves);
  statements.push('call ' + linkedLibraries.get(name).asmName);
}

function compileVariable(name, value) {
  const typesize = 8;
  console.assert(!localVariables.has(name), 'duplicate variable name ' + name);
  localVariables.set(name, {
    // !!                        this is wrong. \/ not everything is a 64 bit #
    offset: typesize + localVariables.size * typesize,
    size: typesize
  });
  if(value.type === 'string') {
    const variableName = compileStringLiteral(value.value);
    statements.push('push ' + variableName)
  } else {
    console.error('dont know how to set a variable to a non string lol')
  }
}

function compileStatement(item) {
  switch(item.type) {
    case 'link': {
      console.assert(item.value in linkables, 'Cannot find linked module: ' + item.value);
      linkedLibraries.set(item.value, linkables[item.value]);
      break;
    }
    case 'invo': {
      compileInvocation(item.value, ...item.args);
      break;
    }
    case 'var': {
      compileVariable(item.name, item.value);
      break;
    }
    default: {
      console.error('unhandled statement ' + item.type);
    }
  }
}

function compile(tree) {
  for(const item of tree.value) {
    compileStatement(item);
  }
  return sections.data() + '\n' + sections.text();
}

module.exports = compile;