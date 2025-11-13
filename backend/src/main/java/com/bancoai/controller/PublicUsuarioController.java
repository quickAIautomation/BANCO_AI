package com.bancoai.controller;

import com.bancoai.dto.UsuarioInfoDTO;
import com.bancoai.model.Usuario;
import com.bancoai.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/usuario")
@CrossOrigin(origins = "*")
public class PublicUsuarioController {
    
    private final UsuarioService usuarioService;
    
    public PublicUsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }
    
    /**
     * Endpoint público para consultar informações de um usuário e suas permissões
     * Requer autenticação via X-API-Key no header
     * Apenas ADMIN pode consultar informações de outros usuários
     * 
     * Exemplo de uso no n8n:
     * POST http://localhost:8080/api/public/usuario/info
     * Header: X-API-Key: sua_chave_api_aqui
     * Content-Type: application/json
     * Body: {
     *   "email": "usuario@exemplo.com"
     * }
     * 
     * Se o email não for informado no body, retorna informações do usuário autenticado
     * 
     * @param requestBody Objeto com email do usuário a ser consultado (opcional)
     * @param authentication Autenticação do usuário via API Key
     * @return Informações do usuário com permissões
     */
    @PostMapping("/info")
    public ResponseEntity<?> obterInfoUsuario(
            @RequestBody(required = false) ConsultaUsuarioRequest requestBody,
            Authentication authentication) {
        try {
            String usuarioAutenticadoEmail = authentication.getName();
            
            // Se não enviou email no body, usar o email do usuário autenticado
            String emailParaConsultar = (requestBody != null && requestBody.getEmail() != null && !requestBody.getEmail().trim().isEmpty())
                    ? requestBody.getEmail().trim()
                    : usuarioAutenticadoEmail;
            
            // Se está consultando outro usuário, verificar se tem permissão (apenas ADMIN)
            if (!emailParaConsultar.equalsIgnoreCase(usuarioAutenticadoEmail)) {
                if (!usuarioService.isAdmin(usuarioAutenticadoEmail)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Apenas administradores podem consultar informações de outros usuários");
                }
            }
            
            Usuario usuario = usuarioService.obterUsuarioCompleto(emailParaConsultar);
            
            UsuarioInfoDTO info = new UsuarioInfoDTO();
            info.setId(usuario.getId());
            info.setEmail(usuario.getEmail());
            info.setNome(usuario.getNome());
            info.setRole(usuario.getRole());
            info.setRoleDescricao(usuario.getRole().getDescricao());
            info.setEmpresaId(usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null);
            info.setEmpresaNome(usuario.getEmpresa() != null ? usuario.getEmpresa().getNome() : null);
            info.setAtivo(usuario.getAtivo());
            
            // Permissões
            info.setPodeCriar(usuarioService.podeCriar(emailParaConsultar));
            info.setPodeEditar(usuarioService.podeEditar(emailParaConsultar));
            info.setPodeDeletar(usuarioService.podeDeletar(emailParaConsultar));
            info.setPodeGerenciarUsuarios(usuario.getRole().podeGerenciarUsuarios());
            info.setPodeGerenciarEmpresas(usuario.getRole().podeGerenciarEmpresas());
            info.setIsAdmin(usuarioService.isAdmin(emailParaConsultar));
            
            return ResponseEntity.ok(info);
        } catch (RuntimeException e) {
            System.err.println("Erro ao obter informações do usuário: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erro ao obter informações: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Erro inesperado ao obter informações do usuário: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro inesperado: " + e.getMessage());
        }
    }
    
    /**
     * Classe interna para receber o email no body da requisição
     */
    public static class ConsultaUsuarioRequest {
        private String email;
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
    }
}

