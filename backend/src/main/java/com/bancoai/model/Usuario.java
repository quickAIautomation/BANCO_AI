package com.bancoai.model;

import com.bancoai.model.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false)
    private String senha;
    
    @Column(nullable = false, length = 50)
    private String nome;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.ADMIN;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;
    
    // Relacionamento Many-to-Many para permitir múltiplas empresas por ADMIN
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "usuario_empresas",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "empresa_id")
    )
    private java.util.Set<Empresa> empresas = new java.util.HashSet<>();
    
    @Column(nullable = false)
    private Boolean ativo = true;
    
    // Método de compatibilidade para manter isAdmin
    public Boolean getIsAdmin() {
        return role == Role.ADMIN;
    }
    
    public void setIsAdmin(Boolean isAdmin) {
        if (isAdmin) {
            this.role = Role.ADMIN;
        } else if (this.role == Role.ADMIN) {
            this.role = Role.OPERADOR;
        }
    }
}

