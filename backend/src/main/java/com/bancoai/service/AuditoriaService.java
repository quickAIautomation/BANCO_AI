package com.bancoai.service;

import com.bancoai.dto.AuditoriaDTO;
import com.bancoai.model.Auditoria;
import com.bancoai.repository.AuditoriaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditoriaService {
    
    private final AuditoriaRepository auditoriaRepository;
    private final ObjectMapper objectMapper;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    
    public AuditoriaService(AuditoriaRepository auditoriaRepository) {
        this.auditoriaRepository = auditoriaRepository;
        // Configurar ObjectMapper com suporte a LocalDateTime
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
    
    @Transactional
    public void registrarAcao(String acao, String entidade, Long entidadeId, 
                             String usuarioEmail, Long empresaId, 
                             Object dadosAnteriores, Object dadosNovos, String observacao) {
        try {
            Auditoria auditoria = new Auditoria();
            auditoria.setAcao(acao);
            auditoria.setEntidade(entidade);
            auditoria.setEntidadeId(entidadeId);
            auditoria.setUsuarioEmail(usuarioEmail);
            auditoria.setEmpresaId(empresaId);
            auditoria.setObservacao(observacao);
            
            if (dadosAnteriores != null) {
                auditoria.setDadosAnteriores(objectMapper.writeValueAsString(dadosAnteriores));
            }
            
            if (dadosNovos != null) {
                auditoria.setDadosNovos(objectMapper.writeValueAsString(dadosNovos));
            }
            
            auditoriaRepository.save(auditoria);
        } catch (Exception e) {
            // Log do erro mas não interrompe a operação principal
            System.err.println("Erro ao registrar auditoria: " + e.getMessage());
        }
    }
    
    @Transactional(readOnly = true)
    public List<AuditoriaDTO> buscarPorEntidade(String entidade, Long entidadeId) {
        return auditoriaRepository.findByEntidadeAndEntidadeIdOrderByDataAcaoDesc(entidade, entidadeId)
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AuditoriaDTO> buscarPorEmpresa(Long empresaId) {
        return auditoriaRepository.findByEmpresaIdOrderByDataAcaoDesc(empresaId)
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    private AuditoriaDTO converterParaDTO(Auditoria auditoria) {
        AuditoriaDTO dto = new AuditoriaDTO();
        dto.setId(auditoria.getId());
        dto.setAcao(auditoria.getAcao());
        dto.setEntidade(auditoria.getEntidade());
        dto.setEntidadeId(auditoria.getEntidadeId());
        dto.setUsuarioEmail(auditoria.getUsuarioEmail());
        dto.setEmpresaId(auditoria.getEmpresaId());
        dto.setDadosAnteriores(auditoria.getDadosAnteriores());
        dto.setDadosNovos(auditoria.getDadosNovos());
        dto.setDataAcao(auditoria.getDataAcao() != null ? auditoria.getDataAcao().format(formatter) : null);
        dto.setObservacao(auditoria.getObservacao());
        return dto;
    }
}

