package com.bancoai.dto;

import com.bancoai.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private String email;
    private String nome;
    private Role role;
    private String roleDescricao;
    private String foto;
    private Boolean emailNotificacoesAtivadas;
    
    public UsuarioDTO(String email, String nome) {
        this.email = email;
        this.nome = nome;
    }
}

