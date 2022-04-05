import { Terminal, TerminalTokenClass } from "../earley";
import { Matcher } from "./regex";

type TokenMatcher = [ RegExp, TerminalTokenClass ];
type Index = number;

interface Match {
  regex: RegExp;
  length: number;
  tokenClass: TerminalTokenClass;
  matchedString: string;
}

// this is kinda bullshit lol exec is a dumb method.
function getFirstMatch(r: RegExp | Matcher, str: string): [Index, string] {
  if (r instanceof RegExp) {
    let matches = str.match(r);
    if(matches === null) return [-1, ''];
    return [matches.index, matches[0]];
  }
}

const getMatchesFromTokenMatcher =
  (str: string) =>
  ([regex, tokenClass]: TokenMatcher): Match =>
{
  const [index, match] = getFirstMatch(regex, str);
  if(index === -1) return null;
  return {
    regex,
    tokenClass,
    length: match.length,
    matchedString: match
  }
}

const advanceLC = (l: number, c: number, str: string) => {
  for(const char of str) {
    c ++;
    if(char === '\n') {
      l ++;
      c = 1;
    }
  }
  return [l, c];
}

export function createTokenizer(tokenMap: TokenMatcher[]) {

  return function tokenize(str: string, l = 1, c = 1): Terminal[] {

    const possibleMatches: Match[] = tokenMap
      .map(getMatchesFromTokenMatcher(str))
      .filter(v => !!v);

    const longestLength = possibleMatches
      .map(v => v.length)
      .reduce((a, v) => a > v ? a : v, -Infinity);

    const longestMatches = possibleMatches
      .filter(v => v.length === longestLength);

    console.assert(longestMatches.length > 0, 'No token matches found');
    if(longestMatches.length === 0) process.exit(1);

    const {tokenClass, matchedString} = longestMatches[0];
    const length = matchedString.length;
    const rest = str.substring(length);

    
    const token = tokenClass ? new tokenClass(l, c, matchedString) : null;
    if(rest === '') return [ token ];

    [l, c] = advanceLC(l, c, str);
    if(tokenClass) {
      return [
        new tokenClass(l, c, matchedString),
        ...tokenize(rest, l, c)
      ]
    }
    return token ? [token, ...tokenize(rest, l, c)] : tokenize(rest, l, c);
  }
}