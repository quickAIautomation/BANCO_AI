package com.bancoai.service;

import com.bancoai.dto.BuscaEmpresaDTO;
import com.bancoai.dto.EmpresaDTO;
import com.bancoai.model.Carro;
import com.bancoai.model.Empresa;
import com.bancoai.repository.CarroRepository;
import com.bancoai.repository.EmpresaRepository;
import com.bancoai.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmpresaService {
    
    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarroRepository carroRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private final String uploadDir = "uploads/carros";
    
    public EmpresaService(EmpresaRepository empresaRepository, 
                          UsuarioRepository usuarioRepository,
                          CarroRepository carroRepository) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.carroRepository = carroRepository;
    }
    
    @Transactional
    public EmpresaDTO criarEmpresa(EmpresaDTO empresaDTO, Long usuarioId) {
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
        
        // Associar empresa ao usuário que a criou (Many-to-Many)
        com.bancoai.model.Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        usuario.getEmpresas().add(empresaSalva);
        usuarioRepository.save(usuario);
        
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
    public List<EmpresaDTO> listarEmpresasDoUsuario(Long usuarioId) {
        return empresaRepository.findByUsuarioId(usuarioId).stream()
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
    
    @Transactional(readOnly = true)
    public Page<EmpresaDTO> buscarComFiltrosPorUsuario(Long usuarioId, BuscaEmpresaDTO buscaDTO) {
        // Configurar ordenação
        Sort sort = criarSort(buscaDTO.getOrdenarPor(), buscaDTO.getDirecao());
        Pageable pageable = PageRequest.of(buscaDTO.getPagina(), buscaDTO.getTamanho(), sort);
        
        // Converter datas se necessário
        java.time.LocalDateTime dataInicio = buscaDTO.getDataInicio();
        java.time.LocalDateTime dataFim = buscaDTO.getDataFim();
        
        Page<Empresa> empresas = empresaRepository.buscarComFiltrosPorUsuario(
            usuarioId,
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
        
        // Deletar todos os carros da empresa antes de deletar a empresa
        deletarTodosCarrosDaEmpresa(id);
        
        // Verificar se há usuários com essa empresa como principal
        List<com.bancoai.model.Usuario> usuariosComEmpresaPrincipal = usuarioRepository.findByEmpresaId(id);
        if (!usuariosComEmpresaPrincipal.isEmpty()) {
            throw new RuntimeException("Não é possível deletar a empresa. Existem " + usuariosComEmpresaPrincipal.size() + " usuário(s) com esta empresa como principal. Altere a empresa principal dos usuários primeiro.");
        }
        
        // Remover relacionamentos Many-to-Many da tabela usuario_empresas
        empresaRepository.deletarRelacionamentosUsuarioEmpresa(id);
        
        // Deletar a empresa do banco de dados
        empresaRepository.delete(empresa);
        empresaRepository.flush(); // Força a execução imediata do delete
    }
    
    /**
     * Deleta todos os carros de uma empresa, incluindo suas fotos do sistema de arquivos
     */
    private void deletarTodosCarrosDaEmpresa(Long empresaId) {
        List<Carro> carros = carroRepository.findByEmpresaId(empresaId);
        
        for (Carro carro : carros) {
            // Deletar fotos do sistema de arquivos
            deletarFotosDoCarro(carro.getFotos());
            
            // Limpar a coleção de fotos antes de deletar
            carro.getFotos().clear();
            carroRepository.saveAndFlush(carro);
            
            // Deletar o carro
            carroRepository.delete(carro);
        }
        
        carroRepository.flush(); // Força a execução imediata dos deletes
    }
    
    /**
     * Deleta as fotos do sistema de arquivos
     */
    private void deletarFotosDoCarro(List<String> fotoUrls) {
        if (fotoUrls == null || fotoUrls.isEmpty()) {
            return;
        }
        
        fotoUrls.forEach(url -> {
            try {
                String nomeArquivo = url.substring(url.lastIndexOf("/") + 1);
                Path caminhoArquivo = Paths.get(uploadDir, nomeArquivo);
                Files.deleteIfExists(caminhoArquivo);
            } catch (IOException e) {
                System.err.println("Erro ao deletar foto: " + url + " - " + e.getMessage());
            }
        });
    }
    
    @Transactional
    public void removerEmpresa(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        
        // Deletar todos os carros da empresa antes de deletar a empresa
        deletarTodosCarrosDaEmpresa(id);
        
        // Verificar se há usuários com essa empresa como principal
        List<com.bancoai.model.Usuario> usuariosComEmpresaPrincipal = usuarioRepository.findByEmpresaId(id);
        if (!usuariosComEmpresaPrincipal.isEmpty()) {
            throw new RuntimeException("Não é possível remover a empresa. Existem " + usuariosComEmpresaPrincipal.size() + " usuário(s) com esta empresa como principal. Altere a empresa principal dos usuários primeiro.");
        }
        
        // Remover relacionamentos Many-to-Many da tabela usuario_empresas
        // Isso remove todos os registros da tabela de junção antes de deletar a empresa
        empresaRepository.deletarRelacionamentosUsuarioEmpresa(id);
        
        // Remover a empresa
        empresaRepository.delete(empresa);
        empresaRepository.flush(); // Força a execução imediata do delete
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

