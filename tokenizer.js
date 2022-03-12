const chalk = require('chalk');

// const keywords = new Map([
//   ['=', 'EQUALS'],
//   ['(', 'LPAREN'],
//   [')', 'RPAREN'],
//   ['link', 'LINK'],
//   ['const', 'CONST'],
// ]);

// const Tokens = {
//   Keyword(str) { return { type: 'KEYWORD', value: keywords.get(str) } },
//   Newline() { return { type: 'NEWLINE' } },
//   Identifier(str) { return { type: 'IDENTIFIER', value: str } },
//   String(str) { return { type: 'STRING', value: str } }
// }

function tokenize(string) {
  let inString = false;
  let escaping = false;
  let tokens = [];
  let token = '';
  // let line = 1;
  // let col = 1;
  // const newline = () => (col = 1, line ++);
  // const nextColumn = () => line ++;
  const resetToken = () => token = '';
  const addToken = (_token) => {
    tokens.push(_token ?? token);
    resetToken();
  }
  // // let _line = line;
  // // let _col = col;
  // if(_token) {
  //   token = _token;
  // }
  // if(token.trim() !== '') {
  //   if(keywords.has(token))
  //     tokens.push(Tokens.Keyword(token));
  //   else if (isStringDelim(token[0]))
  //     tokens.push(Tokens.String(token));
  //   else if (token === 'NEWLINE')
  //     tokens.push(Tokens.Newline())
  //   else
  //     tokens.push(Tokens.Identifier(token));
  //   resetToken();
  // }
  const isWhitespace = (char) => [' ', '\n', '\t', '\r'].includes(char);
  const isNewline = (char) => char === '\n';
  const isSingleCharToken = (char) => ['(', ')', '='].includes(char);
  const isStringDelim = (char) => ["'", '"'].includes(char);
  const isEscapeChar = (char) => char === '\\';
  const escape = (char) => (char === 'n' ? '\n'
                          : char === 't' ? '\t'
                          : char === 'r' ? '\r' : char)

  for (const char of string) {
    if(isNewline(char)) {
      // newline();
      addToken();
      // only add newlines if we've actually started tokens...
      if(tokens.length > 0)
        addToken('NEWLINE')
    } else if (escaping) {
      token += escape(char)
      escaping = false;
    } else if (isStringDelim(char)) {
      token += char;
      inString = !inString;
    } else if (inString) {
      if(isEscapeChar(char)) {
        escaping = true;
      } else {
        token += char
      }
    } else if(isSingleCharToken(char)) {
      addToken();
      addToken(char);
    } else if(isWhitespace(char)) {
      addToken();
    } else {
      token += char;
    }
    // if(!isNewline(char))
    //   nextColumn();
  }

  return tokens;
}

module.exports = tokenize;

const tokens = tokenize(require('fs').readFileSync('disco.disco').toString('utf-8'));


require('fs').writeFileSync('bytecode.json', JSON.stringify(tokens, null, 2))

