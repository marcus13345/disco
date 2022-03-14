import * as chalk from 'chalk';
import { readFileSync, writeFileSync } from 'fs';
import { $Identifier, $KeywordConst, $KeywordEquals, $KeywordLink, $KeywordLParen, $KeywordRParen, $Newline, $String } from './grammar';


const keywords = new Map([
  ['=', $KeywordEquals],
  ['(', $KeywordLParen],
  [')', $KeywordRParen],
  ['link', $KeywordLink],
  ['const', $KeywordConst],
]);

export function tokenize(string) {
  let inString = false;
  let escaping = false;
  let tokens = [];
  let token = '';
  // let line = 1;
  // let col = 1;
  // const newline = () => (col = 1, line ++);
  // const nextColumn = () => line ++;
  const resetToken = () => token = '';
  const addToken = (_token?) => {
    if(_token) {
      token = _token;
    }
    if(token.trim() !== '') {
      if(keywords.has(token)) {
        const kwTokenClass = keywords.get(token);
        tokens.push(new kwTokenClass(0, 0, token));
      } else if (isStringDelim(token[0]))
        tokens.push(new $String(0, 0, token.substring(1, token.length - 1)));
      else if (token === 'NEWLINE')
        tokens.push(new $Newline(0, 0, token))
      else
        tokens.push(new $Identifier(0, 0, token));
      resetToken();
    }
  }
  // let _line = line;
  // let _col = col;

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