import { Terminal } from '../earley';
import { createTokenizer } from './generalTokenizer';

class $Number extends Terminal { }
class $Plus extends Terminal { }
class $Newline extends Terminal { }

const tokenizer = createTokenizer([
  { match: /^[0-9]{1,}$/,       token: $Number  },
  { match: /^[\r\t ]{1,}$/,     token: null     },
  { match: '\n',                token: $Newline },
  { match: '+',                 token: $Plus    },
])

console.log(tokenizer("5 + \n 6   ").map(v => v.toString()).join('  '));