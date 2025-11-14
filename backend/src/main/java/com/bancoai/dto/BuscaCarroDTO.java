package com.bancoai.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BuscaCarroDTO {
    private String placa;
    private String modelo;
    private String marca;
    private Integer quilometragemMin;
    private Integer quilometragemMax;
    private java.math.BigDecimal valorMin;
    private java.math.BigDecimal valorMax;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataInicio;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataFim;
    
    private String ordenarPor = "dataCadastro"; // dataCadastro, quilometragem, modelo, marca
    private String direcao = "DESC"; // ASC, DESC
    private Integer pagina = 0;
    private Integer tamanho = 20;
}

