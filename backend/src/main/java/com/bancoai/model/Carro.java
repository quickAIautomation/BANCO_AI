package com.bancoai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carros")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Carro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;
    
    @Column(nullable = false, length = 10)
    private String placa;
    
    @Column(nullable = false)
    private Integer quilometragem;
    
    @Column(nullable = false, length = 100)
    private String modelo;
    
    @Column(nullable = false, length = 50)
    private String marca;
    
    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal valor;
    
    @Column(columnDefinition = "TEXT")
    private String observacoes;
    
    @ElementCollection
    @CollectionTable(name = "carro_fotos", joinColumns = @JoinColumn(name = "carro_id"))
    @Column(name = "foto_url")
    private List<String> fotos = new ArrayList<>();
    
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
}

