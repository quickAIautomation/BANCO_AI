package com.bancoai.service;

import com.bancoai.dto.AuthResponseDTO;
import com.bancoai.dto.LoginDTO;
import com.bancoai.model.Usuario;
import com.bancoai.repository.UsuarioRepository;
import com.bancoai.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    
    public AuthService(UsuarioRepository usuarioRepository, 
                      PasswordEncoder passwordEncoder,
                      JwtTokenProvider tokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }
    
    public AuthResponseDTO login(LoginDTO loginDTO) {
        Usuario usuario = usuarioRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));
        
        if (!passwordEncoder.matches(loginDTO.getSenha(), usuario.getSenha())) {
            throw new RuntimeException("Credenciais inválidas");
        }
        
        if (!usuario.getAtivo()) {
            throw new RuntimeException("Usuário inativo. Entre em contato com o administrador.");
        }
        
        if (usuario.getEmpresa() == null || !usuario.getEmpresa().getAtiva()) {
            throw new RuntimeException("Empresa inativa. Entre em contato com o administrador.");
        }
        
        String token = tokenProvider.generateToken(usuario.getEmail());
        
        return new AuthResponseDTO(
            token, 
            usuario.getEmail(), 
            usuario.getNome(),
            usuario.getRole(),
            usuario.getRole().getDescricao(),
            usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null,
            usuario.getEmpresa() != null ? usuario.getEmpresa().getNome() : null
        );
    }
}

