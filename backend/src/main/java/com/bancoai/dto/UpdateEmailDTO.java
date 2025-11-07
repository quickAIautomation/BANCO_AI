package com.bancoai.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateEmailDTO {
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String novoEmail;
    
    @NotBlank(message = "Senha atual é obrigatória")
    private String senhaAtual;
}

