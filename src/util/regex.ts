type Match = {
  offset: number;
  length: number;
  text: string;
  original: string;
}

const match = (offset: number, length: number, text: string, original: string): Match => {
  return { offset, length, text, original };
}

export type Matcher = (str: string) => Match[]

export const matchChar = (char: string): Matcher => {
  const matcher = (test: string) => {
    return test[0] === char[0] ? [match(0, 1, test[0], test)] : []
  }
  matcher.toString = () => {
    return char;
  }
  return matcher;
}

export const matchCharClass = (chars: string[]): Matcher => {
  const matcher = (test: string) => {
    return chars.includes(test[0]) ? [match(0, 1, test[0], test)] : []
  }
  matcher.toString = () => {
    return '[' + chars.join('') + ']';
  }
  return matcher;
}

const combineMatches = (a: Match, b: Match): Match => {
  return match(
    Math.min(a.offset, b.offset),
    a.length + b.length,
    a.text + b.text,
    a.original.length > b.original.length ? a.original : b.original
  )
}

export const matchSequence = (matcherA: Matcher, matcherB: Matcher): Matcher => {
  const matcher = (test: string) => {
    const matches = [];
    for (const match of matcherA(test)) {
      const rest = test.substring(match.length);
      for (const restMatch of matcherB(rest)) {
        matches.push(combineMatches(match, restMatch));
      }
    }
    return matches;
  }
  matcher.toString = () => {
    return matcherA.toString() + matcherB.toString();
  }
  return matcher;
}

const repeatMatcher = (matcher: Matcher, test: string, n: number): Match[] => {
  if(n === 0) {
    return [match(0, 0, '', test)];
  }
  const matches = matcher(test);
  if(n === 1) {
    return matches;
  }
  return matches.map(match => {
    const rest = match.original.substring(match.length);
    return repeatMatcher(matcher, rest, n - 1).map(nextMatch => combineMatches(match, nextMatch));
  }).flat();
}

// this logic sucks lol
// really you should just keep matching until you
// have no more characters or you hit the match limit.
// like this shit increases O by 2 on each nested call...
// TODO /\ \/ /\ \/ /\ \/ /\ \/ /\ \/ /\ \/ /\ \/ /\
export const matchMany = (matcherA: Matcher, min = 1, max = Infinity): Matcher => {
  const matcher = (test: string) => {
    const rmatches: Match[] = [];
    const limitedMax = Math.min(max, test.length);
    for(let c = min; c <= limitedMax; c ++) {
      const matches = repeatMatcher(matcherA, test, c);
      rmatches.push(...matches);
    }
    return rmatches;
  }
  matcher.toString = () => {
    return '(' + (matcherA.toString()) + '){' + (min === 0 ? '' : min) + ',' + (max === Infinity ? '' : max) + '}';
  }
  return matcher;
}

// variable names regex, theory...


const matchers = [
  matchChar('a'),
  matchCharClass(['a', 'b', 'c']),
  matchSequence(
    matchChar('a'),
    matchCharClass(['a', 'b', 'c'])
  ),
  matchMany(
    matchCharClass(['a', 'b', 'c'])
  ),
  matchMany(
    matchCharClass(['a', 'b', 'c']),
    1,
    1
  ),
];

const tests = [
  'a',
  'b',
  'c',
  'd',
  'ab',
  'bc',
  'cd',
  'da',
]

console.clear();

const logMatches = (ms: Match[]) => {
  for(const match of ms) {
    console.log(
      ' '.repeat(8) +
      chalk.white(match.original.substring(0, match.offset)) +
      chalk.green(match.text) + 
      chalk.white(match.original.substring(match.offset + match.length))
    );
  }
}

const Y = true;
const N = false;
const testMatrix = [
  [Y, N, N, N, N, N, N, N],
  [Y, Y, Y, N, N, N, N, N],
  [N, N, N, N, Y, N, N, N],
  [Y, Y, Y, N, Y, Y, N, N],
  [Y, Y, Y, N, N, N, N, N]
]
import * as chalk from 'chalk';
// dirty levels off the CHARTS
let i = 0, j = 0, p = 0, f = 0;
for (const matcher of matchers) {
  j = 0;
  for (const testString of tests) {
    const matches = matcher(testString).filter(match => match.length === testString.length);
    if (matches.length > 0 === testMatrix[i][j]) {
      p ++;
    } else {
      f ++;
      console.log(
        chalk.red('[ FAIL ]'),
        chalk.ansi256(143)('/' + matcher.toString() + '/'),
        'incorrectly returned',
        matches.length,
        'match' + (matches.length !== 1 ? 'es' : '') + ' for',
        testString,
      );
      logMatches(matches);
      console.log('')
    }
    j++;
  }
  i++
}
console.log('' + p + ' test' + (p !== 1 ? 's' : '') + ' passed.')
console.log('' + f + ' test' + (f !== 1 ? 's' : '') + ' failed.')
process.exit(f);