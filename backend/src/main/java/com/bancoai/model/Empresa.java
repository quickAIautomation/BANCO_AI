package com.bancoai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "empresas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String nome;
    
    @Column(length = 100)
    private String cnpj;
    
    @Column(length = 200)
    private String endereco;
    
    @Column(length = 50)
    private String telefone;
    
    @Column(length = 100)
    private String email;
    
    @Column(nullable = false)
    private Boolean ativa = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCadastro;
    
    @Column(nullable = false)
    private LocalDateTime dataAtualizacao;
    
    @PrePersist
    protected void onCreate() {
        dataCadastro = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
    
    // Relacionamento Many-to-Many bidirecional com Usuario
    @ManyToMany(mappedBy = "empresas", fetch = FetchType.LAZY)
    private java.util.Set<com.bancoai.model.Usuario> usuarios = new java.util.HashSet<>();
}

