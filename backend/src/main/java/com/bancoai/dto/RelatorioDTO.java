package com.bancoai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelatorioDTO {
    private Long totalCarros;
    private Long totalPorMarca;
    private List<Map<String, Object>> carrosPorMarca;
    private List<Map<String, Object>> evolucaoCadastros; // Por mês/ano
}

