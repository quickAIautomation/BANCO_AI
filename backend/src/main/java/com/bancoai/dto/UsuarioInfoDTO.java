package com.bancoai.dto;

import com.bancoai.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioInfoDTO {
    private Long id;
    private String email;
    private String nome;
    private Role role;
    private String roleDescricao;
    private Long empresaId;
    private String empresaNome;
    private Boolean ativo;
    
    // Permissões
    private Boolean podeCriar;
    private Boolean podeEditar;
    private Boolean podeDeletar;
    private Boolean podeGerenciarUsuarios;
    private Boolean podeGerenciarEmpresas;
    private Boolean isAdmin;
}

