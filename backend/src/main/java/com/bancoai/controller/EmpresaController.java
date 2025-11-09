package com.bancoai.controller;

import com.bancoai.dto.BuscaEmpresaDTO;
import com.bancoai.dto.EmpresaDTO;
import com.bancoai.service.EmpresaService;
import com.bancoai.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(origins = "http://localhost:3000")
public class EmpresaController {
    
    private final EmpresaService empresaService;
    private final UsuarioService usuarioService;
    
    public EmpresaController(EmpresaService empresaService, UsuarioService usuarioService) {
        this.empresaService = empresaService;
        this.usuarioService = usuarioService;
    }
    
    @GetMapping
    public ResponseEntity<List<EmpresaDTO>> listarTodas(Authentication authentication) {
        try {
            // Apenas admins podem listar todas as empresas
            String email = authentication.getName();
            if (!usuarioService.isAdmin(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            List<EmpresaDTO> empresas = empresaService.listarTodas();
            return ResponseEntity.ok(empresas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/buscar")
    public ResponseEntity<Page<EmpresaDTO>> buscarComFiltros(@RequestBody BuscaEmpresaDTO buscaDTO,
                                                              Authentication authentication) {
        try {
            // Apenas admins podem buscar empresas
            String email = authentication.getName();
            if (!usuarioService.isAdmin(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            Page<EmpresaDTO> empresas = empresaService.buscarComFiltros(buscaDTO);
            return ResponseEntity.ok(empresas);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmpresaDTO> buscarPorId(@PathVariable Long id, Authentication authentication) {
        try {
            EmpresaDTO empresa = empresaService.buscarPorId(id);
            return ResponseEntity.ok(empresa);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<EmpresaDTO> criarEmpresa(@Valid @RequestBody EmpresaDTO empresaDTO, 
                                                   Authentication authentication) {
        try {
            // Apenas admins podem criar empresas
            String email = authentication.getName();
            if (!usuarioService.isAdmin(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            EmpresaDTO empresaCriada = empresaService.criarEmpresa(empresaDTO);
            return ResponseEntity.status(201).body(empresaCriada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EmpresaDTO> atualizarEmpresa(@PathVariable Long id,
                                                        @Valid @RequestBody EmpresaDTO empresaDTO,
                                                        Authentication authentication) {
        try {
            // Apenas admins podem atualizar empresas
            String email = authentication.getName();
            if (!usuarioService.isAdmin(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            EmpresaDTO empresaAtualizada = empresaService.atualizarEmpresa(id, empresaDTO);
            return ResponseEntity.ok(empresaAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarEmpresa(@PathVariable Long id, Authentication authentication) {
        try {
            // Apenas admins podem deletar empresas
            String email = authentication.getName();
            if (!usuarioService.isAdmin(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            empresaService.deletarEmpresa(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

