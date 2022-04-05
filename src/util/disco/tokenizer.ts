import { $Newline } from "../../earley";
import { createTokenizer } from "../generalTokenizer";
import * as t from './tokens';

export default createTokenizer([
  [ /^[\r\t ]{1,}/, null],
  [ /^\n/, $Newline],
  [/[a-zA-Z][A-Za-z0-9]{0,}/, t.$Identifier],
])