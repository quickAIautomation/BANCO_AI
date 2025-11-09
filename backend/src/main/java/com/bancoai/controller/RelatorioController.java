package com.bancoai.controller;

import com.bancoai.dto.RelatorioDTO;
import com.bancoai.service.RelatorioService;
import com.bancoai.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/relatorios")
@CrossOrigin(origins = "http://localhost:3000")
public class RelatorioController {
    
    private final RelatorioService relatorioService;
    private final UsuarioService usuarioService;
    
    public RelatorioController(RelatorioService relatorioService, UsuarioService usuarioService) {
        this.relatorioService = relatorioService;
        this.usuarioService = usuarioService;
    }
    
    @GetMapping
    public ResponseEntity<RelatorioDTO> gerarRelatorio(Authentication authentication) {
        try {
            String email = authentication.getName();
            Long empresaId = usuarioService.obterUsuarioCompleto(email).getEmpresa().getId();
            
            RelatorioDTO relatorio = relatorioService.gerarRelatorio(empresaId);
            return ResponseEntity.ok(relatorio);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

