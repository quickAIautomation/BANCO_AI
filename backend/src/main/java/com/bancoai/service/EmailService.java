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
    
    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    public void enviarEmailResetSenha(String email, String token) {
        if (!emailEnabled) {
            System.err.println("AVISO: Envio de email está desabilitado. Token de redefinição: " + token);
            throw new RuntimeException("Envio de email está desabilitado. Entre em contato com o administrador.");
        }
        
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
            System.out.println("Email de redefinição de senha enviado com sucesso para: " + email);
        } catch (org.springframework.mail.MailAuthenticationException e) {
            System.err.println("ERRO: Falha na autenticação do servidor de email");
            System.err.println("Detalhes: " + e.getMessage());
            System.err.println("SOLUÇÃO: Verifique as credenciais de email configuradas:");
            System.err.println("  - MAIL_USERNAME e MAIL_PASSWORD no arquivo banco-ai.service");
            System.err.println("  - Para Gmail: gere uma nova senha de app em: https://myaccount.google.com/apppasswords");
            System.err.println("  - Para SendGrid: use a API Key em vez de senha");
            e.printStackTrace();
            throw new RuntimeException("Erro ao enviar email: Falha na autenticação. Verifique as credenciais de email no servidor (arquivo banco-ai.service).");
        } catch (org.springframework.mail.MailSendException e) {
            System.err.println("ERRO: Falha ao enviar email");
            System.err.println("Detalhes: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("Causa: " + e.getCause().getMessage());
            }
            e.printStackTrace();
            throw new RuntimeException("Erro ao enviar email: " + e.getMessage() + ". Verifique a configuração do servidor de email.");
        } catch (org.springframework.mail.MailException e) {
            System.err.println("ERRO: Exceção de email");
            System.err.println("Detalhes: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao enviar email: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("ERRO INESPERADO ao enviar email");
            System.err.println("Tipo: " + e.getClass().getName());
            System.err.println("Mensagem: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro inesperado ao enviar email: " + e.getMessage());
        }
    }
}

