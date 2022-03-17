import { Terminal, TerminalTokenClass } from "../earley";

type TokenMatcher = [ RegExp, TerminalTokenClass ];

interface Match {
  regex: RegExp;
  length: number;
  tokenClass: TerminalTokenClass;
  matchedString: string;
}

// this is kinda bullshit lol exec is a dumb method.
function getFirstMatch(r: RegExp, str: string): [number, string] {
  let matches = str.match(r);
  if(matches === null) return [-1, ''];
  return [matches.index, matches[0]];
}

export function createTokenizer(tokenMap: TokenMatcher[]) {

  return function tokenize(str: string, l = 1, c = 1): Terminal[] {

    const possibleMatches: Match[] = tokenMap
      .map(([regex, tokenClass]) => {
        const [index, match] = getFirstMatch(regex, str);
        if(index === -1) return null;
        return {
          regex,
          tokenClass,
          length: match.length,
          matchedString: match
        }
      })
      .filter(v => !!v);

    const longestLength = possibleMatches
      .map(v => v.length)
      .reduce((a, v) => a > v ? a : v, -Infinity);

    const longestMatches = possibleMatches
      .filter(v => v.length === longestLength);

    console.assert(longestMatches.length > 0, 'No token matches found');

    const [{tokenClass, matchedString}] = longestMatches;
    const length = matchedString.length;
    const token = tokenClass ? new tokenClass(l, c, matchedString) : null;

    const rest = str.substring(length);

    if(rest === '') return [ token ];

    for(const char of matchedString) {
      c ++;
      if(char === '\n') {
        l ++;
        c = 1;
      }
    }

    return token ? [token, ...tokenize(rest, l, c)] : tokenize(rest, l, c);
  }
}