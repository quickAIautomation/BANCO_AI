package com.bancoai.controller;

import com.bancoai.dto.AuthResponseDTO;
import com.bancoai.dto.EsqueceuSenhaDTO;
import com.bancoai.dto.LoginDTO;
import com.bancoai.dto.RegisterDTO;
import com.bancoai.dto.ResetSenhaDTO;
import com.bancoai.service.AuthService;
import com.bancoai.service.ResetSenhaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthService authService;
    private final ResetSenhaService resetSenhaService;
    
    public AuthController(AuthService authService, ResetSenhaService resetSenhaService) {
        this.authService = authService;
        this.resetSenhaService = resetSenhaService;
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            AuthResponseDTO response = authService.login(loginDTO);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/esqueceu-senha")
    public ResponseEntity<?> esqueceuSenha(@Valid @RequestBody EsqueceuSenhaDTO esqueceuSenhaDTO) {
        try {
            resetSenhaService.solicitarResetSenha(esqueceuSenhaDTO.getEmail());
            return ResponseEntity.ok().body("Email de redefinição de senha enviado com sucesso");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/reset-senha")
    public ResponseEntity<?> resetSenha(@Valid @RequestBody ResetSenhaDTO resetSenhaDTO) {
        try {
            resetSenhaService.resetarSenha(resetSenhaDTO);
            return ResponseEntity.ok().body("Senha redefinida com sucesso");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO registerDTO) {
        try {
            AuthResponseDTO response = authService.register(registerDTO);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

