module.exports = {
  asmName: '_exit_with_code',
  asm: `\
  push rax
  mov rax, 60
  pop rdi
  syscall
`
}