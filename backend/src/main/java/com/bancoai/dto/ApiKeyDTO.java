package com.bancoai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiKeyDTO {
    private Long id;
    private String chave;
    private String nome;
    private Boolean ativa;
    private LocalDateTime dataCriacao;
    private LocalDateTime ultimoUso;
    private Long totalUsos;
}

