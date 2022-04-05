import { Terminal } from '../earley';
import { createTokenizer } from './generalTokenizer';

class $Number extends Terminal { }
class $Plus extends Terminal { }
class $Newline extends Terminal { }

const tokenizer = createTokenizer([
  [ /^[0-9]{1,}$/,       $Number  ],
  [ /^[\r\t ]{1,}$/,     null     ],
  [ /\n/,                $Newline ],
  [ /+/,                 $Plus    ],
])

console.log(tokenizer("5 + \n 6   ").map(v => v.toString()).join('  '));