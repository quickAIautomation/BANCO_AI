package com.bancoai.model.enums;

public enum Role {
    ADMIN("Administrador"),
    OPERADOR("Operador"),
    VISUALIZADOR("Visualizador");
    
    private final String descricao;
    
    Role(String descricao) {
        this.descricao = descricao;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public boolean podeCriar() {
        return this == ADMIN || this == OPERADOR;
    }
    
    public boolean podeEditar() {
        return this == ADMIN || this == OPERADOR;
    }
    
    public boolean podeDeletar() {
        return this == ADMIN;
    }
    
    public boolean podeGerenciarUsuarios() {
        return this == ADMIN;
    }
    
    public boolean podeGerenciarEmpresas() {
        return this == ADMIN;
    }
}

