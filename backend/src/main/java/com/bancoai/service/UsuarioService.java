package com.bancoai.service;

import com.bancoai.dto.BuscaUsuarioDTO;
import com.bancoai.dto.CriarUsuarioDTO;
import com.bancoai.dto.UpdateEmailDTO;
import com.bancoai.dto.UpdateSenhaDTO;
import com.bancoai.dto.UsuarioCompletoDTO;
import com.bancoai.dto.UsuarioDTO;
import com.bancoai.model.Empresa;
import com.bancoai.model.Usuario;
import com.bancoai.model.enums.Role;
import com.bancoai.repository.ApiKeyRepository;
import com.bancoai.repository.EmpresaRepository;
import com.bancoai.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final PasswordEncoder passwordEncoder;
    private final String uploadDir = "uploads/usuarios";
    
    public UsuarioService(UsuarioRepository usuarioRepository,
                          EmpresaRepository empresaRepository,
                          ApiKeyRepository apiKeyRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.apiKeyRepository = apiKeyRepository;
        this.passwordEncoder = passwordEncoder;
        createUploadDirectory();
    }
    
    private void createUploadDirectory() {
        try {
            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            System.err.println("Erro ao criar diretório de upload de usuários: " + e.getMessage());
        }
    }
    
    public UsuarioDTO obterUsuarioPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        UsuarioDTO dto = new UsuarioDTO(usuario.getEmail(), usuario.getNome());
        dto.setRole(usuario.getRole());
        dto.setRoleDescricao(usuario.getRole().getDescricao());
        dto.setFoto(usuario.getFoto());
        dto.setEmailNotificacoesAtivadas(usuario.getEmailNotificacoesAtivadas());
        return dto;
    }
    
    public boolean isAdmin(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuario -> usuario.getRole() == Role.ADMIN)
                .orElse(false);
    }
    
    public boolean podeCriar(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuario -> usuario.getRole().podeCriar())
                .orElse(false);
    }
    
    public boolean podeEditar(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuario -> usuario.getRole().podeEditar())
                .orElse(false);
    }
    
    public boolean podeDeletar(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuario -> usuario.getRole().podeDeletar())
                .orElse(false);
    }
    
    public Usuario obterUsuarioCompleto(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
    
    @Transactional
    public UsuarioCompletoDTO criarUsuario(CriarUsuarioDTO criarUsuarioDTO, MultipartFile foto, String adminEmail) {
        // Verificar se o admin tem permissão
        Usuario admin = usuarioRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Administrador não encontrado"));
        
        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Apenas administradores podem criar usuários");
        }
        
        // Verificar se email já existe
        if (usuarioRepository.existsByEmail(criarUsuarioDTO.getEmail())) {
            throw new RuntimeException("Este email já está em uso");
        }
        
        // Forçar que o usuário só pode criar na sua própria empresa
        Long empresaId = admin.getEmpresa().getId();
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        
        // Criar usuário
        Usuario usuario = new Usuario();
        usuario.setEmail(criarUsuarioDTO.getEmail());
        usuario.setSenha(passwordEncoder.encode(criarUsuarioDTO.getSenha()));
        usuario.setNome(criarUsuarioDTO.getNome());
        usuario.setRole(criarUsuarioDTO.getRole());
        usuario.setEmpresa(empresa);
        usuario.setAtivo(true);
        
        // Salvar foto se fornecida
        if (foto != null && !foto.isEmpty()) {
            String fotoUrl = salvarFoto(foto, criarUsuarioDTO.getEmail());
            usuario.setFoto(fotoUrl);
        }
        
        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        return converterParaCompletoDTO(usuarioSalvo);
    }
    
    @Transactional
    public UsuarioCompletoDTO atualizarUsuario(Long usuarioId, CriarUsuarioDTO atualizarUsuarioDTO, MultipartFile foto, String adminEmail) {
        Usuario admin = usuarioRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Administrador não encontrado"));
        
        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Apenas administradores podem atualizar usuários");
        }
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Atualizar campos básicos
        if (atualizarUsuarioDTO.getNome() != null) {
            usuario.setNome(atualizarUsuarioDTO.getNome());
        }
        if (atualizarUsuarioDTO.getRole() != null) {
            usuario.setRole(atualizarUsuarioDTO.getRole());
        }
        
        // Atualizar foto se fornecida
        if (foto != null && !foto.isEmpty()) {
            // Deletar foto antiga se existir
            if (usuario.getFoto() != null) {
                deletarFoto(usuario.getFoto());
            }
            String fotoUrl = salvarFoto(foto, usuario.getEmail());
            usuario.setFoto(fotoUrl);
        }
        
        Usuario usuarioAtualizado = usuarioRepository.save(usuario);
        return converterParaCompletoDTO(usuarioAtualizado);
    }
    
    private String salvarFoto(MultipartFile foto, String email) {
        try {
            String extensao = foto.getOriginalFilename() != null 
                    ? foto.getOriginalFilename().substring(foto.getOriginalFilename().lastIndexOf("."))
                    : ".jpg";
            String nomeArquivo = email.replace("@", "_").replace(".", "_") + "_" + UUID.randomUUID().toString() + extensao;
            Path caminhoArquivo = Paths.get(uploadDir, nomeArquivo);
            
            Files.copy(foto.getInputStream(), caminhoArquivo, StandardCopyOption.REPLACE_EXISTING);
            
            return "/api/usuarios/fotos/" + nomeArquivo;
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar foto do usuário", e);
        }
    }
    
    private void deletarFoto(String fotoUrl) {
        try {
            if (fotoUrl != null && fotoUrl.startsWith("/api/usuarios/fotos/")) {
                String nomeArquivo = fotoUrl.substring(fotoUrl.lastIndexOf("/") + 1);
                Path caminhoArquivo = Paths.get(uploadDir, nomeArquivo);
                Files.deleteIfExists(caminhoArquivo);
            }
        } catch (IOException e) {
            System.err.println("Erro ao deletar foto do usuário: " + fotoUrl);
        }
    }
    
    @Transactional(readOnly = true)
    public List<UsuarioCompletoDTO> listarUsuariosPorEmpresa(Long empresaId) {
        return usuarioRepository.findByEmpresaId(empresaId).stream()
                .map(this::converterParaCompletoDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<UsuarioCompletoDTO> buscarUsuariosComFiltros(BuscaUsuarioDTO buscaDTO) {
        // Configurar ordenação
        Sort sort = criarSort(buscaDTO.getOrdenarPor(), buscaDTO.getDirecao());
        Pageable pageable = PageRequest.of(buscaDTO.getPagina(), buscaDTO.getTamanho(), sort);
        
        Page<Usuario> usuarios = usuarioRepository.buscarComFiltros(
            buscaDTO.getNome(),
            buscaDTO.getEmail(),
            buscaDTO.getEmpresaId(),
            buscaDTO.getRole(),
            buscaDTO.getAtivo(),
            pageable
        );
        
        return usuarios.map(this::converterParaCompletoDTO);
    }
    
    @Transactional(readOnly = true)
    public Page<UsuarioCompletoDTO> listarTodosUsuarios(Integer pagina, Integer tamanho) {
        Sort sort = Sort.by(Sort.Direction.ASC, "nome");
        Pageable pageable = PageRequest.of(pagina, tamanho, sort);
        
        Page<Usuario> usuarios = usuarioRepository.findAll(pageable);
        return usuarios.map(this::converterParaCompletoDTO);
    }
    
    private Sort criarSort(String ordenarPor, String direcao) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(direcao) ? 
                                   Sort.Direction.ASC : Sort.Direction.DESC;
        
        switch (ordenarPor != null ? ordenarPor.toLowerCase() : "nome") {
            case "email":
                return Sort.by(direction, "email");
            case "datacadastro":
                return Sort.by(direction, "id"); // Usando ID como proxy para data de cadastro
            default:
                return Sort.by(direction, "nome");
        }
    }
    
    @Transactional
    public UsuarioCompletoDTO atualizarRoleUsuario(Long usuarioId, Role novoRole, String adminEmail) {
        Usuario admin = usuarioRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Administrador não encontrado"));
        
        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Apenas administradores podem alterar permissões");
        }
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        usuario.setRole(novoRole);
        Usuario usuarioAtualizado = usuarioRepository.save(usuario);
        return converterParaCompletoDTO(usuarioAtualizado);
    }
    
    @Transactional
    public void ativarDesativarUsuario(Long usuarioId, Boolean ativo, String adminEmail) {
        Usuario admin = usuarioRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Administrador não encontrado"));
        
        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Apenas administradores podem ativar/desativar usuários");
        }
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        usuario.setAtivo(ativo);
        usuarioRepository.save(usuario);
    }
    
    private UsuarioCompletoDTO converterParaCompletoDTO(Usuario usuario) {
        UsuarioCompletoDTO dto = new UsuarioCompletoDTO();
        dto.setId(usuario.getId());
        dto.setEmail(usuario.getEmail());
        dto.setNome(usuario.getNome());
        dto.setRole(usuario.getRole());
        dto.setRoleDescricao(usuario.getRole().getDescricao());
        dto.setEmpresaId(usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null);
        dto.setEmpresaNome(usuario.getEmpresa() != null ? usuario.getEmpresa().getNome() : null);
        dto.setAtivo(usuario.getAtivo());
        dto.setFoto(usuario.getFoto());
        return dto;
    }
    
    @Transactional
    public void atualizarEmail(String emailAtual, UpdateEmailDTO updateEmailDTO) {
        Usuario usuario = usuarioRepository.findByEmail(emailAtual)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Verificar senha atual
        if (!passwordEncoder.matches(updateEmailDTO.getSenhaAtual(), usuario.getSenha())) {
            throw new RuntimeException("Senha atual incorreta");
        }
        
        // Verificar se o novo email já existe
        if (usuarioRepository.existsByEmail(updateEmailDTO.getNovoEmail()) && 
            !usuario.getEmail().equals(updateEmailDTO.getNovoEmail())) {
            throw new RuntimeException("Este email já está em uso");
        }
        
        usuario.setEmail(updateEmailDTO.getNovoEmail());
        usuarioRepository.save(usuario);
    }
    
    @Transactional
    public void atualizarSenha(String email, UpdateSenhaDTO updateSenhaDTO) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Verificar senha atual
        if (!passwordEncoder.matches(updateSenhaDTO.getSenhaAtual(), usuario.getSenha())) {
            throw new RuntimeException("Senha atual incorreta");
        }
        
        // Verificar se a nova senha é diferente da atual
        if (passwordEncoder.matches(updateSenhaDTO.getNovaSenha(), usuario.getSenha())) {
            throw new RuntimeException("A nova senha deve ser diferente da senha atual");
        }
        
        // Atualizar senha
        usuario.setSenha(passwordEncoder.encode(updateSenhaDTO.getNovaSenha()));
        usuarioRepository.save(usuario);
    }
    
    @Transactional
    public UsuarioDTO atualizarFotoPerfil(String email, MultipartFile foto) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Atualizar foto se fornecida
        if (foto != null && !foto.isEmpty()) {
            // Deletar foto antiga se existir
            if (usuario.getFoto() != null) {
                deletarFoto(usuario.getFoto());
            }
            String fotoUrl = salvarFoto(foto, usuario.getEmail());
            usuario.setFoto(fotoUrl);
            usuarioRepository.save(usuario);
        }
        
        return obterUsuarioPorEmail(email);
    }
    
    @Transactional
    public void atualizarEmailNotificacoes(String email, Boolean emailNotificacoesAtivadas) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        usuario.setEmailNotificacoesAtivadas(emailNotificacoesAtivadas);
        usuarioRepository.save(usuario);
    }
    
    @Transactional
    public void removerUsuario(Long usuarioId, String adminEmail) {
        Usuario admin = usuarioRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Administrador não encontrado"));
        
        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Apenas administradores podem remover usuários");
        }
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Não permitir remover a si mesmo
        if (usuario.getId().equals(admin.getId())) {
            throw new RuntimeException("Você não pode remover a si mesmo");
        }
        
        // Verificar se é o último ADMIN (não permitir remover)
        if (usuario.getRole() == Role.ADMIN) {
            long totalAdmins = usuarioRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN && u.getAtivo())
                    .count();
            if (totalAdmins <= 1) {
                throw new RuntimeException("Não é possível remover o último administrador do sistema");
            }
        }
        
        // Remover todas as API Keys do usuário
        apiKeyRepository.findByUsuario(usuario).forEach(apiKeyRepository::delete);
        
        // Deletar foto do usuário se existir
        if (usuario.getFoto() != null) {
            deletarFoto(usuario.getFoto());
        }
        
        // Remover relacionamentos Many-to-Many com empresas
        usuario.getEmpresas().clear();
        usuarioRepository.save(usuario);
        
        // Remover o usuário
        usuarioRepository.delete(usuario);
    }
}

