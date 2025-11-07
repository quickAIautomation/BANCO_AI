package com.bancoai.config;

import com.bancoai.model.Empresa;
import com.bancoai.model.Usuario;
import com.bancoai.model.enums.Role;
import com.bancoai.repository.EmpresaRepository;
import com.bancoai.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;
    
    public DataInitializer(UsuarioRepository usuarioRepository, 
                          EmpresaRepository empresaRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public void run(String... args) {
        // Criar empresa padrão se não existir
        Empresa empresaPadrao = empresaRepository.findByNome("Empresa Padrão")
                .orElse(null);
        
        if (empresaPadrao == null) {
            empresaPadrao = new Empresa();
            empresaPadrao.setNome("Empresa Padrão");
            empresaPadrao.setAtiva(true);
            empresaPadrao = empresaRepository.save(empresaPadrao);
            System.out.println("Empresa padrão criada: " + empresaPadrao.getNome());
        }
        
        // Criar usuário admin se não existir
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setEmail("admin@bancoai.com");
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setNome("Administrador");
            admin.setRole(Role.ADMIN);
            admin.setEmpresa(empresaPadrao);
            admin.setAtivo(true);
            usuarioRepository.save(admin);
            System.out.println("Usuário administrador criado: admin@bancoai.com / admin123");
        }
    }
}

