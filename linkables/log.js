module.exports = {
  asmName: '_log',
  asm: `\
  push rdi
  mov rbx, 0
_log_loop:
  mov cl, [rdi]
  cmp cl, 0
  je _log_loop_end
  inc rdi
  inc rbx
  jmp _log_loop
_log_loop_end:
  mov rdx, rbx
  mov rax, 1
  mov rdi, 1
  pop rsi
  syscall
  push 10
  mov rax, 1
  mov rdi, 1
  mov rsi, rsp
  mov rdx, 1
  syscall
  pop rdi
  ret`
}