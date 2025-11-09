package com.bancoai.service;

import com.bancoai.dto.ApiKeyDTO;
import com.bancoai.dto.CriarApiKeyDTO;
import com.bancoai.model.ApiKey;
import com.bancoai.model.Usuario;
import com.bancoai.repository.ApiKeyRepository;
import com.bancoai.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApiKeyService {
    
    private final ApiKeyRepository apiKeyRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    
    public ApiKeyService(ApiKeyRepository apiKeyRepository, UsuarioRepository usuarioRepository) {
        this.apiKeyRepository = apiKeyRepository;
        this.usuarioRepository = usuarioRepository;
    }
    
    /**
     * Gera uma nova chave API para o usuário
     */
    @Transactional
    public ApiKeyDTO criarApiKey(String usuarioEmail, CriarApiKeyDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        String chave = gerarChaveUnica();
        
        ApiKey apiKey = new ApiKey();
        apiKey.setChave(chave);
        apiKey.setNome(dto.getNome() != null && !dto.getNome().trim().isEmpty() 
                ? dto.getNome() 
                : "API Key " + LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        apiKey.setUsuario(usuario);
        apiKey.setAtiva(true);
        
        apiKey = apiKeyRepository.save(apiKey);
        
        return converterParaDTO(apiKey);
    }
    
    /**
     * Lista todas as API Keys do usuário
     */
    public List<ApiKeyDTO> listarApiKeys(String usuarioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        return apiKeyRepository.findByUsuario(usuario).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Desativa uma API Key
     */
    @Transactional
    public void desativarApiKey(Long id, String usuarioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("API Key não encontrada"));
        
        if (!apiKey.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Você não tem permissão para desativar esta API Key");
        }
        
        apiKey.setAtiva(false);
        apiKeyRepository.save(apiKey);
    }
    
    /**
     * Ativa uma API Key
     */
    @Transactional
    public void ativarApiKey(Long id, String usuarioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("API Key não encontrada"));
        
        if (!apiKey.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Você não tem permissão para ativar esta API Key");
        }
        
        apiKey.setAtiva(true);
        apiKeyRepository.save(apiKey);
    }
    
    /**
     * Deleta uma API Key
     */
    @Transactional
    public void deletarApiKey(Long id, String usuarioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("API Key não encontrada"));
        
        if (!apiKey.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Você não tem permissão para deletar esta API Key");
        }
        
        apiKeyRepository.delete(apiKey);
    }
    
    /**
     * Valida uma API Key e retorna o usuário associado
     */
    public Optional<Usuario> validarApiKey(String chave) {
        Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByChave(chave);
        
        if (apiKeyOpt.isPresent()) {
            ApiKey apiKey = apiKeyOpt.get();
            
            if (apiKey.getAtiva()) {
                // Atualizar estatísticas de uso
                apiKey.setUltimoUso(LocalDateTime.now());
                apiKey.setTotalUsos(apiKey.getTotalUsos() + 1);
                apiKeyRepository.save(apiKey);
                
                return Optional.of(apiKey.getUsuario());
            }
        }
        
        return Optional.empty();
    }
    
    /**
     * Gera uma chave única
     */
    private String gerarChaveUnica() {
        String chave;
        do {
            byte[] bytes = new byte[32];
            secureRandom.nextBytes(bytes);
            chave = "bai_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        } while (apiKeyRepository.existsByChave(chave));
        
        return chave;
    }
    
    /**
     * Converte ApiKey para DTO (sem expor a chave completa para segurança)
     */
    private ApiKeyDTO converterParaDTO(ApiKey apiKey) {
        ApiKeyDTO dto = new ApiKeyDTO();
        dto.setId(apiKey.getId());
        // Mostrar apenas os últimos 8 caracteres da chave para segurança
        String chave = apiKey.getChave();
        dto.setChave(chave.length() > 8 ? "..." + chave.substring(chave.length() - 8) : chave);
        dto.setNome(apiKey.getNome());
        dto.setAtiva(apiKey.getAtiva());
        dto.setDataCriacao(apiKey.getDataCriacao());
        dto.setUltimoUso(apiKey.getUltimoUso());
        dto.setTotalUsos(apiKey.getTotalUsos());
        return dto;
    }
    
    /**
     * Retorna a chave completa apenas na criação
     */
    public ApiKeyDTO converterParaDTOCompleto(ApiKey apiKey) {
        ApiKeyDTO dto = new ApiKeyDTO();
        dto.setId(apiKey.getId());
        dto.setChave(apiKey.getChave()); // Chave completa
        dto.setNome(apiKey.getNome());
        dto.setAtiva(apiKey.getAtiva());
        dto.setDataCriacao(apiKey.getDataCriacao());
        dto.setUltimoUso(apiKey.getUltimoUso());
        dto.setTotalUsos(apiKey.getTotalUsos());
        return dto;
    }
}

