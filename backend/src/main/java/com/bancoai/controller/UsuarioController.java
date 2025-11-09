package com.bancoai.controller;

import com.bancoai.dto.BuscaUsuarioDTO;
import com.bancoai.dto.CriarUsuarioDTO;
import com.bancoai.dto.UpdateEmailDTO;
import com.bancoai.dto.UpdateSenhaDTO;
import com.bancoai.dto.UsuarioCompletoDTO;
import com.bancoai.dto.UsuarioDTO;
import com.bancoai.model.enums.Role;
import com.bancoai.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:3000")
public class UsuarioController {
    
    private final UsuarioService usuarioService;
    
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }
    
    @GetMapping("/perfil")
    public ResponseEntity<UsuarioDTO> obterPerfil(Authentication authentication) {
        try {
            String email = authentication.getName();
            UsuarioDTO usuario = usuarioService.obterUsuarioPorEmail(email);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/perfil/email")
    public ResponseEntity<?> atualizarEmail(@Valid @RequestBody UpdateEmailDTO updateEmailDTO,
                                           Authentication authentication) {
        try {
            String emailAtual = authentication.getName();
            usuarioService.atualizarEmail(emailAtual, updateEmailDTO);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/perfil/senha")
    public ResponseEntity<?> atualizarSenha(@Valid @RequestBody UpdateSenhaDTO updateSenhaDTO,
                                            Authentication authentication) {
        try {
            String email = authentication.getName();
            usuarioService.atualizarSenha(email, updateSenhaDTO);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Endpoints de gerenciamento de usuários (apenas para admins)
    
    @PostMapping
    public ResponseEntity<?> criarUsuario(@Valid @RequestBody CriarUsuarioDTO criarUsuarioDTO,
                                          Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            UsuarioCompletoDTO usuarioCriado = usuarioService.criarUsuario(criarUsuarioDTO, adminEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCriado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao criar usuário: " + e.getMessage());
        }
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro de validação: " + errors);
    }
    
    @GetMapping("/empresa")
    public ResponseEntity<List<UsuarioCompletoDTO>> listarUsuariosPorEmpresa(Authentication authentication) {
        try {
            String email = authentication.getName();
            Long empresaId = usuarioService.obterUsuarioCompleto(email).getEmpresa().getId();
            
            // Apenas admins podem listar usuários
            if (!usuarioService.isAdmin(email)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
            
            List<UsuarioCompletoDTO> usuarios = usuarioService.listarUsuariosPorEmpresa(empresaId);
            return ResponseEntity.ok(usuarios);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<UsuarioCompletoDTO>> listarUsuariosPorEmpresaId(
            @PathVariable Long empresaId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            
            // Apenas admins podem listar usuários de qualquer empresa
            if (!usuarioService.isAdmin(email)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
            
            List<UsuarioCompletoDTO> usuarios = usuarioService.listarUsuariosPorEmpresa(empresaId);
            return ResponseEntity.ok(usuarios);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/role")
    public ResponseEntity<UsuarioCompletoDTO> atualizarRoleUsuario(
            @PathVariable Long id,
            @RequestBody Role novoRole,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            UsuarioCompletoDTO usuarioAtualizado = usuarioService.atualizarRoleUsuario(id, novoRole, adminEmail);
            return ResponseEntity.ok(usuarioAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/ativo")
    public ResponseEntity<Void> ativarDesativarUsuario(
            @PathVariable Long id,
            @RequestBody Boolean ativo,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            usuarioService.ativarDesativarUsuario(id, ativo, adminEmail);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/todos")
    public ResponseEntity<Page<UsuarioCompletoDTO>> listarTodosUsuarios(
            @RequestParam(defaultValue = "0") Integer pagina,
            @RequestParam(defaultValue = "20") Integer tamanho,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            
            // Apenas admins podem listar todos os usuários
            if (!usuarioService.isAdmin(email)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
            
            Page<UsuarioCompletoDTO> usuarios = usuarioService.listarTodosUsuarios(pagina, tamanho);
            return ResponseEntity.ok(usuarios);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/buscar")
    public ResponseEntity<Page<UsuarioCompletoDTO>> buscarUsuariosComFiltros(
            @RequestBody BuscaUsuarioDTO buscaDTO,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            
            // Apenas admins podem buscar usuários
            if (!usuarioService.isAdmin(email)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
            
            Page<UsuarioCompletoDTO> usuarios = usuarioService.buscarUsuariosComFiltros(buscaDTO);
            return ResponseEntity.ok(usuarios);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

