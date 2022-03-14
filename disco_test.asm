section .data
  EFDNYLFZ db 72,101,108,108,111,32,87,111,114,108,100,0
section .text
  global _start
_start:
  push rbp
  mov rbp, rsp
  mov rdi, EFDNYLFZ
  call _log
  mov rsp, rbp
  pop rbp
  mov rax, 60
  mov rdi, 0
  syscall
_log:
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
  ret