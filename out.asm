section .data
  QVGWSIUM db 84,104,105,115,32,83,116,114,105,110,103,32,105,115,32,67,111,110,116,97,105,110,101,100,32,105,110,32,97,32,118,97,114,105,97,98,108,101,0
  ZYXGJUBF db 84,104,105,115,32,105,115,32,97,32,115,101,99,111,110,100,32,115,116,114,105,110,103,32,105,110,32,97,32,118,97,114,105,97,98,108,101,0
  GPBLFTCX db 104,101,108,108,111,0
  GXMDWCDF db 119,111,114,108,100,0
section .text
  global _start
_start:
  push rbp
  mov rbp, rsp
  push QVGWSIUM
  push ZYXGJUBF
  mov rdi, GPBLFTCX
  call _log
  mov rdi, GXMDWCDF
  call _log
  mov rdi, [rbp - 8]
  call _log
  mov rdi, [rbp - 16]
  call _log
  mov rdi, [rbp - 8]
  call _log
  mov rdi, [rbp - 16]
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