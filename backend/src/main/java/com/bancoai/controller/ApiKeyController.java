package com.bancoai.controller;

import com.bancoai.dto.ApiKeyDTO;
import com.bancoai.dto.CriarApiKeyDTO;
import com.bancoai.model.ApiKey;
import com.bancoai.repository.ApiKeyRepository;
import com.bancoai.service.ApiKeyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apikeys")
@CrossOrigin(origins = "http://localhost:3000")
public class ApiKeyController {
    
    private final ApiKeyService apiKeyService;
    private final ApiKeyRepository apiKeyRepository;
    
    public ApiKeyController(ApiKeyService apiKeyService, ApiKeyRepository apiKeyRepository) {
        this.apiKeyService = apiKeyService;
        this.apiKeyRepository = apiKeyRepository;
    }
    
    /**
     * Cria uma nova API Key
     */
    @PostMapping
    public ResponseEntity<ApiKeyDTO> criarApiKey(
            @RequestBody CriarApiKeyDTO dto,
            Authentication authentication) {
        try {
            String usuarioEmail = authentication.getName();
            ApiKey apiKey = apiKeyRepository.findById(
                apiKeyService.criarApiKey(usuarioEmail, dto).getId()
            ).orElseThrow();
            
            // Retornar a chave completa apenas na criação
            ApiKeyDTO response = apiKeyService.converterParaDTOCompleto(apiKey);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Lista todas as API Keys do usuário
     */
    @GetMapping
    public ResponseEntity<List<ApiKeyDTO>> listarApiKeys(Authentication authentication) {
        try {
            String usuarioEmail = authentication.getName();
            List<ApiKeyDTO> apiKeys = apiKeyService.listarApiKeys(usuarioEmail);
            return ResponseEntity.ok(apiKeys);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Desativa uma API Key
     */
    @PutMapping("/{id}/desativar")
    public ResponseEntity<Void> desativarApiKey(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String usuarioEmail = authentication.getName();
            apiKeyService.desativarApiKey(id, usuarioEmail);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Ativa uma API Key
     */
    @PutMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarApiKey(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String usuarioEmail = authentication.getName();
            apiKeyService.ativarApiKey(id, usuarioEmail);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Deleta uma API Key
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarApiKey(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String usuarioEmail = authentication.getName();
            apiKeyService.deletarApiKey(id, usuarioEmail);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}

