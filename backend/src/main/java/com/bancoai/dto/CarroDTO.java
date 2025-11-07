package com.bancoai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarroDTO {
    private Long id;
    private Long empresaId;
    private String empresaNome;
    private String placa;
    private Integer quilometragem;
    private String modelo;
    private String marca;
    private String observacoes;
    private List<String> fotos;
    private String dataCadastro;
    private String dataAtualizacao;
}

