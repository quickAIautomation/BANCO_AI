package com.bancoai.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reset_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private LocalDateTime dataExpiracao;
    
    @Column(nullable = false)
    private Boolean usado = false;
    
    public boolean isExpirado() {
        return LocalDateTime.now().isAfter(dataExpiracao);
    }
    
    public boolean isValid() {
        return !usado && !isExpirado();
    }
}

