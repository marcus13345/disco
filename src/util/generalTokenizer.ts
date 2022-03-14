import { TerminalTokenClass } from "../earley";

export function createTokenizer(tokenMap: Map<string | RegExp, TerminalTokenClass>) {
  return function tokenize(str: string) {
    let tokens = [];
    let token = '';
    let line = 1, column = 0;
    for(let i = 0; i < str.length; i ++) {
      const char = str[i];
      const lookahead = (i < str.length - 1 ? str[i + 1] : null)
      column++;
      token += char;

      for(const [matcher, tokenClass] of tokenMap) {
        if(typeof matcher === 'string') {
          if(matcher === token) {
            tokens.push(new tokenClass(line, column, token));
          } else {
            // dw about it
          }
        } else {
          // matcher is regex...
          // * note: this only tests if token contains a match, not that it _is_ a match
          if(matcher.test(token)) {
            if(lookahead) {
              if(!matcher.test(token + lookahead)) {
                // the next character would not match, so this must be the match.
                // ! PS: it is possible that even though this would no longer
                // ! match, another matcher could still match more.
                // ! in those cases, we would want to expand on this logic
                // ! to only match if there are no matches for any matcher
                // ! in the lookahead.
                // ! in practice this means tracking all possible non lookahead
                // ! matches, then testing them for their lookahead afterwards
                // ! in another loop, and only tokenizing if you have only one
                // ! option, and that option will fail on the lookahead.
              }
            } else {
              tokens.push(new tokenClass(line, column, token));
            }
          }
        }
      }

      if(char === '\n') {
        line ++;
        column = 0;
      }
    }
  }
}