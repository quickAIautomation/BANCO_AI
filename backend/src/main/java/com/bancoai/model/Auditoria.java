package com.bancoai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Auditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 50)
    private String acao; // CREATE, UPDATE, DELETE
    
    @Column(nullable = false, length = 50)
    private String entidade; // CARRO, USUARIO, EMPRESA
    
    @Column(nullable = false)
    private Long entidadeId;
    
    @Column(length = 100)
    private String usuarioEmail;
    
    @Column
    private Long empresaId;
    
    @Column(columnDefinition = "TEXT")
    private String dadosAnteriores; // JSON com dados antes da alteração
    
    @Column(columnDefinition = "TEXT")
    private String dadosNovos; // JSON com dados novos
    
    @Column(nullable = false)
    private LocalDateTime dataAcao;
    
    @Column(length = 200)
    private String observacao;
    
    @PrePersist
    protected void onCreate() {
        dataAcao = LocalDateTime.now();
    }
}

