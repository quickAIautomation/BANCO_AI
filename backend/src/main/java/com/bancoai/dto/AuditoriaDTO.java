package com.bancoai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaDTO {
    private Long id;
    private String acao;
    private String entidade;
    private Long entidadeId;
    private String usuarioEmail;
    private Long empresaId;
    private String dadosAnteriores;
    private String dadosNovos;
    private String dataAcao;
    private String observacao;
}

