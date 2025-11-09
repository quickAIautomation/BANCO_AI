package com.bancoai.dto;

import com.bancoai.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CriarUsuarioDTO {
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;
    
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    private String senha;
    
    @NotBlank(message = "Nome é obrigatório")
    private String nome;
    
    @NotNull(message = "Role é obrigatório")
    private Role role;
    
    @NotNull(message = "Empresa é obrigatória")
    private Long empresaId;
    
    // Método para ajudar na deserialização do Role
    public void setRole(String roleString) {
        try {
            this.role = Role.valueOf(roleString.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Role inválido: " + roleString + ". Valores aceitos: ADMIN, OPERADOR, VISUALIZADOR");
        }
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
}

