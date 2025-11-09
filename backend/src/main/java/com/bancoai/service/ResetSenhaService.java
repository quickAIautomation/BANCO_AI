package com.bancoai.service;

import com.bancoai.dto.ResetSenhaDTO;
import com.bancoai.model.ResetToken;
import com.bancoai.model.Usuario;
import com.bancoai.repository.ResetTokenRepository;
import com.bancoai.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ResetSenhaService {
    
    private final ResetTokenRepository resetTokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    public ResetSenhaService(ResetTokenRepository resetTokenRepository,
                            UsuarioRepository usuarioRepository,
                            EmailService emailService,
                            PasswordEncoder passwordEncoder) {
        this.resetTokenRepository = resetTokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Transactional
    public void solicitarResetSenha(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado"));
        
        if (!usuario.getAtivo()) {
            throw new RuntimeException("Usuário inativo. Entre em contato com o administrador.");
        }
        
        // Remove tokens anteriores para este email
        resetTokenRepository.deleteByEmail(email);
        
        // Gera novo token
        String token = UUID.randomUUID().toString();
        LocalDateTime dataExpiracao = LocalDateTime.now().plusHours(1);
        
        ResetToken resetToken = new ResetToken();
        resetToken.setToken(token);
        resetToken.setEmail(email);
        resetToken.setDataExpiracao(dataExpiracao);
        resetToken.setUsado(false);
        
        resetTokenRepository.save(resetToken);
        
        // Envia email
        emailService.enviarEmailResetSenha(email, token);
    }
    
    @Transactional
    public void resetarSenha(ResetSenhaDTO resetSenhaDTO) {
        ResetToken resetToken = resetTokenRepository.findByToken(resetSenhaDTO.getToken())
                .orElseThrow(() -> new RuntimeException("Token inválido"));
        
        if (!resetToken.isValid()) {
            throw new RuntimeException("Token expirado ou já utilizado");
        }
        
        Usuario usuario = usuarioRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Atualiza senha
        usuario.setSenha(passwordEncoder.encode(resetSenhaDTO.getNovaSenha()));
        usuarioRepository.save(usuario);
        
        // Marca token como usado
        resetToken.setUsado(true);
        resetTokenRepository.save(resetToken);
    }
}

