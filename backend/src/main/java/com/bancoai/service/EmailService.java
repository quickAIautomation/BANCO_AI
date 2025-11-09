package com.bancoai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:quickAI.automation@gmail.com}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    public void enviarEmailResetSenha(String email, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("Redefinição de Senha - BANCO AI");
        
        String resetUrl = frontendUrl + "/reset-senha?token=" + token;
        
        String texto = "Olá,\n\n" +
                "Você solicitou a redefinição de senha para sua conta no BANCO AI.\n\n" +
                "Clique no link abaixo para redefinir sua senha:\n" +
                resetUrl + "\n\n" +
                "Este link expira em 1 hora.\n\n" +
                "Se você não solicitou esta redefinição, ignore este email.\n\n" +
                "Atenciosamente,\n" +
                "Equipe BANCO AI";
        
        message.setText(texto);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao enviar email: " + e.getMessage());
        }
    }
}

