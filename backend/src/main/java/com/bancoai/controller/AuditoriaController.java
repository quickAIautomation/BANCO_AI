package com.bancoai.controller;

import com.bancoai.dto.AuditoriaDTO;
import com.bancoai.service.AuditoriaService;
import com.bancoai.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
@CrossOrigin(origins = "http://localhost:3000")
public class AuditoriaController {
    
    private final AuditoriaService auditoriaService;
    private final UsuarioService usuarioService;
    
    public AuditoriaController(AuditoriaService auditoriaService, UsuarioService usuarioService) {
        this.auditoriaService = auditoriaService;
        this.usuarioService = usuarioService;
    }
    
    @GetMapping("/entidade/{entidade}/{entidadeId}")
    public ResponseEntity<List<AuditoriaDTO>> buscarPorEntidade(
            @PathVariable String entidade,
            @PathVariable Long entidadeId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Long empresaId = usuarioService.obterUsuarioCompleto(email).getEmpresa().getId();
            
            // Verificar se a entidade pertence à empresa do usuário
            List<AuditoriaDTO> auditorias = auditoriaService.buscarPorEntidade(entidade, entidadeId);
            
            // Filtrar apenas auditorias da empresa do usuário
            List<AuditoriaDTO> auditoriasFiltradas = auditorias.stream()
                    .filter(a -> a.getEmpresaId() != null && a.getEmpresaId().equals(empresaId))
                    .toList();
            
            return ResponseEntity.ok(auditoriasFiltradas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/empresa")
    public ResponseEntity<List<AuditoriaDTO>> buscarPorEmpresa(Authentication authentication) {
        try {
            String email = authentication.getName();
            Long empresaId = usuarioService.obterUsuarioCompleto(email).getEmpresa().getId();
            
            List<AuditoriaDTO> auditorias = auditoriaService.buscarPorEmpresa(empresaId);
            return ResponseEntity.ok(auditorias);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

