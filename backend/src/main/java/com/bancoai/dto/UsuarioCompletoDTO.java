package com.bancoai.dto;

import com.bancoai.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioCompletoDTO {
    private Long id;
    private String email;
    private String nome;
    private Role role;
    private String roleDescricao;
    private Long empresaId;
    private String empresaNome;
    private Boolean ativo;
    private String foto;
}

