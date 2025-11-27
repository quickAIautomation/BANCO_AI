package com.bancoai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
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
    
    @NotBlank(message = "Placa é obrigatória")
    private String placa;
    
    @NotNull(message = "Quilometragem é obrigatória")
    @PositiveOrZero(message = "Quilometragem deve ser maior ou igual a zero")
    private Integer quilometragem;
    
    @NotBlank(message = "Modelo é obrigatório")
    private String modelo;
    
    @NotBlank(message = "Marca é obrigatória")
    private String marca;
    
    @NotNull(message = "Ano é obrigatório")
    @Min(value = 1900, message = "Ano deve ser maior que 1900")
    @Max(value = 2030, message = "Ano deve ser menor que 2030")
    private Integer ano;
    
    @PositiveOrZero(message = "Valor deve ser maior ou igual a zero")
    private java.math.BigDecimal valor;
    
    private String observacoes;
    private List<String> fotos;
    private String dataCadastro;
    private String dataAtualizacao;
}

