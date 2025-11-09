package com.bancoai.service;

import com.bancoai.dto.BuscaEmpresaDTO;
import com.bancoai.dto.EmpresaDTO;
import com.bancoai.model.Empresa;
import com.bancoai.repository.EmpresaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmpresaService {
    
    private final EmpresaRepository empresaRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    
    public EmpresaService(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }
    
    @Transactional
    public EmpresaDTO criarEmpresa(EmpresaDTO empresaDTO) {
        if (empresaRepository.existsByNome(empresaDTO.getNome())) {
            throw new RuntimeException("Já existe uma empresa com este nome");
        }
        
        Empresa empresa = new Empresa();
        empresa.setNome(empresaDTO.getNome());
        empresa.setCnpj(empresaDTO.getCnpj());
        empresa.setEndereco(empresaDTO.getEndereco());
        empresa.setTelefone(empresaDTO.getTelefone());
        empresa.setEmail(empresaDTO.getEmail());
        empresa.setAtiva(empresaDTO.getAtiva() != null ? empresaDTO.getAtiva() : true);
        
        Empresa empresaSalva = empresaRepository.save(empresa);
        return converterParaDTO(empresaSalva);
    }
    
    @Transactional
    public EmpresaDTO atualizarEmpresa(Long id, EmpresaDTO empresaDTO) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        
        if (!empresa.getNome().equals(empresaDTO.getNome()) && 
            empresaRepository.existsByNome(empresaDTO.getNome())) {
            throw new RuntimeException("Já existe uma empresa com este nome");
        }
        
        empresa.setNome(empresaDTO.getNome());
        empresa.setCnpj(empresaDTO.getCnpj());
        empresa.setEndereco(empresaDTO.getEndereco());
        empresa.setTelefone(empresaDTO.getTelefone());
        empresa.setEmail(empresaDTO.getEmail());
        if (empresaDTO.getAtiva() != null) {
            empresa.setAtiva(empresaDTO.getAtiva());
        }
        
        Empresa empresaAtualizada = empresaRepository.save(empresa);
        return converterParaDTO(empresaAtualizada);
    }
    
    @Transactional(readOnly = true)
    public List<EmpresaDTO> listarTodas() {
        return empresaRepository.findByAtivaTrue().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<EmpresaDTO> buscarComFiltros(BuscaEmpresaDTO buscaDTO) {
        // Configurar ordenação
        Sort sort = criarSort(buscaDTO.getOrdenarPor(), buscaDTO.getDirecao());
        Pageable pageable = PageRequest.of(buscaDTO.getPagina(), buscaDTO.getTamanho(), sort);
        
        // Converter datas se necessário
        java.time.LocalDateTime dataInicio = buscaDTO.getDataInicio();
        java.time.LocalDateTime dataFim = buscaDTO.getDataFim();
        
        Page<Empresa> empresas = empresaRepository.buscarComFiltros(
            buscaDTO.getNome(),
            buscaDTO.getCnpj(),
            buscaDTO.getEmail(),
            buscaDTO.getAtiva(),
            dataInicio,
            dataFim,
            pageable
        );
        
        return empresas.map(this::converterParaDTO);
    }
    
    private Sort criarSort(String ordenarPor, String direcao) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(direcao) ? 
                                   Sort.Direction.ASC : Sort.Direction.DESC;
        
        switch (ordenarPor != null ? ordenarPor.toLowerCase() : "datacadastro") {
            case "nome":
                return Sort.by(direction, "nome");
            case "cnpj":
                return Sort.by(direction, "cnpj");
            default:
                return Sort.by(direction, "dataCadastro");
        }
    }
    
    @Transactional(readOnly = true)
    public EmpresaDTO buscarPorId(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        return converterParaDTO(empresa);
    }
    
    @Transactional
    public void deletarEmpresa(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        
        // Desativar ao invés de deletar
        empresa.setAtiva(false);
        empresaRepository.save(empresa);
    }
    
    private EmpresaDTO converterParaDTO(Empresa empresa) {
        EmpresaDTO dto = new EmpresaDTO();
        dto.setId(empresa.getId());
        dto.setNome(empresa.getNome());
        dto.setCnpj(empresa.getCnpj());
        dto.setEndereco(empresa.getEndereco());
        dto.setTelefone(empresa.getTelefone());
        dto.setEmail(empresa.getEmail());
        dto.setAtiva(empresa.getAtiva());
        dto.setDataCadastro(empresa.getDataCadastro() != null 
                ? empresa.getDataCadastro().format(formatter) 
                : null);
        dto.setDataAtualizacao(empresa.getDataAtualizacao() != null 
                ? empresa.getDataAtualizacao().format(formatter) 
                : null);
        return dto;
    }
}

