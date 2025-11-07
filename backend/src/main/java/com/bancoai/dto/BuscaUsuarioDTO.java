package com.bancoai.dto;

import com.bancoai.model.enums.Role;
import lombok.Data;

@Data
public class BuscaUsuarioDTO {
    private String nome;
    private String email;
    private Long empresaId;
    private Role role;
    private Boolean ativo;
    private String ordenarPor = "nome"; // nome, email, dataCadastro
    private String direcao = "ASC"; // ASC, DESC
    private Integer pagina = 0;
    private Integer tamanho = 20;
}

