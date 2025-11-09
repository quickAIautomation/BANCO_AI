package com.bancoai.dto;

import com.bancoai.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String email;
    private String nome;
    private Role role;
    private String roleDescricao;
    private Long empresaId;
    private String empresaNome;
}

