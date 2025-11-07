package com.bancoai.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BuscaEmpresaDTO {
    private String nome;
    private String cnpj;
    private String email;
    private Boolean ativa;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private String ordenarPor = "dataCadastro"; // dataCadastro, nome, cnpj
    private String direcao = "DESC"; // ASC, DESC
    private Integer pagina = 0;
    private Integer tamanho = 20;
}

