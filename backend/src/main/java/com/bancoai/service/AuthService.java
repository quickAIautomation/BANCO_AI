package com.bancoai.service;

import com.bancoai.dto.AuthResponseDTO;
import com.bancoai.dto.LoginDTO;
import com.bancoai.dto.RegisterDTO;
import com.bancoai.model.Empresa;
import com.bancoai.model.Usuario;
import com.bancoai.model.enums.Role;
import com.bancoai.repository.EmpresaRepository;
import com.bancoai.repository.UsuarioRepository;
import com.bancoai.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    
    public AuthService(UsuarioRepository usuarioRepository,
                      EmpresaRepository empresaRepository,
                      PasswordEncoder passwordEncoder,
                      JwtTokenProvider tokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
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
    
    @Transactional
    public AuthResponseDTO register(RegisterDTO registerDTO) {
        // Verificar se email já existe
        if (usuarioRepository.existsByEmail(registerDTO.getEmail())) {
            throw new RuntimeException("Este email já está em uso");
        }
        
        // Verificar se empresa com mesmo nome já existe
        if (empresaRepository.existsByNome(registerDTO.getNomeEmpresa())) {
            throw new RuntimeException("Já existe uma empresa com este nome");
        }
        
        // Criar empresa
        Empresa empresa = new Empresa();
        empresa.setNome(registerDTO.getNomeEmpresa());
        empresa.setAtiva(true);
        empresa = empresaRepository.save(empresa);
        
        // Criar usuário ADMIN
        Usuario usuario = new Usuario();
        usuario.setEmail(registerDTO.getEmail());
        usuario.setSenha(passwordEncoder.encode(registerDTO.getSenha()));
        usuario.setNome(registerDTO.getNome());
        usuario.setRole(Role.ADMIN);
        usuario.setEmpresa(empresa);
        usuario.setAtivo(true);
        
        usuario = usuarioRepository.save(usuario);
        
        // Fazer login automático
        String token = tokenProvider.generateToken(usuario.getEmail());
        
        return new AuthResponseDTO(
            token,
            usuario.getEmail(),
            usuario.getNome(),
            usuario.getRole(),
            usuario.getRole().getDescricao(),
            usuario.getEmpresa().getId(),
            usuario.getEmpresa().getNome()
        );
    }
}

