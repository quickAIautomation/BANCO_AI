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
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
    
    @PutMapping(value = "/perfil/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> atualizarFotoPerfil(
            @RequestPart(value = "foto", required = false) MultipartFile foto,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            UsuarioDTO usuarioAtualizado = usuarioService.atualizarFotoPerfil(email, foto);
            return ResponseEntity.ok(usuarioAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao atualizar foto: " + e.getMessage());
        }
    }
    
    @PutMapping("/perfil/email-notificacoes")
    public ResponseEntity<?> atualizarEmailNotificacoes(
            @RequestBody Boolean emailNotificacoesAtivadas,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            usuarioService.atualizarEmailNotificacoes(email, emailNotificacoesAtivadas);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Endpoints de gerenciamento de usuários (apenas para admins)
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> criarUsuario(
            @RequestPart("usuario") @Valid CriarUsuarioDTO criarUsuarioDTO,
            @RequestPart(value = "foto", required = false) MultipartFile foto,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            UsuarioCompletoDTO usuarioCriado = usuarioService.criarUsuario(criarUsuarioDTO, foto, adminEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCriado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao criar usuário: " + e.getMessage());
        }
    }
    
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> atualizarUsuario(
            @PathVariable Long id,
            @RequestPart("usuario") @Valid CriarUsuarioDTO atualizarUsuarioDTO,
            @RequestPart(value = "foto", required = false) MultipartFile foto,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            UsuarioCompletoDTO usuarioAtualizado = usuarioService.atualizarUsuario(id, atualizarUsuarioDTO, foto, adminEmail);
            return ResponseEntity.ok(usuarioAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao atualizar usuário: " + e.getMessage());
        }
    }
    
    @GetMapping("/fotos/{nomeArquivo}")
    public ResponseEntity<Resource> obterFoto(@PathVariable String nomeArquivo) {
        try {
            Path caminhoArquivo = Paths.get("uploads/usuarios").resolve(nomeArquivo).normalize();
            Resource resource = new UrlResource(caminhoArquivo.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(caminhoArquivo);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
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
            
            // Qualquer usuário pode ver os usuários da sua própria empresa
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
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removerUsuario(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            usuarioService.removerUsuario(id, adminEmail);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao remover usuário: " + e.getMessage());
        }
    }
}

