package com.bancoai.service;

import com.bancoai.dto.BuscaCarroDTO;
import com.bancoai.dto.CarroDTO;
import com.bancoai.model.Carro;
import com.bancoai.model.Empresa;
import com.bancoai.repository.CarroRepository;
import com.bancoai.repository.EmpresaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CarroService {
    
    private final CarroRepository carroRepository;
    private final EmpresaRepository empresaRepository;
    private final AuditoriaService auditoriaService;
    private final String uploadDir = "uploads/carros";
    
    public CarroService(CarroRepository carroRepository, 
                       EmpresaRepository empresaRepository,
                       AuditoriaService auditoriaService) {
        this.carroRepository = carroRepository;
        this.empresaRepository = empresaRepository;
        this.auditoriaService = auditoriaService;
        createUploadDirectory();
    }
    
    private void createUploadDirectory() {
        try {
            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("Erro ao criar diretório de uploads", e);
        }
    }
    
    @Transactional
    public CarroDTO criarCarro(CarroDTO carroDTO, List<MultipartFile> fotos, Long empresaId, String usuarioEmail) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        
        if (carroRepository.existsByPlacaAndEmpresaId(carroDTO.getPlaca().toUpperCase(), empresaId)) {
            throw new RuntimeException("Já existe um carro cadastrado com esta placa nesta empresa");
        }
        
        Carro carro = new Carro();
        carro.setEmpresa(empresa);
        carro.setPlaca(carroDTO.getPlaca().toUpperCase());
        carro.setQuilometragem(carroDTO.getQuilometragem());
        carro.setModelo(carroDTO.getModelo());
        carro.setMarca(carroDTO.getMarca());
        carro.setObservacoes(carroDTO.getObservacoes());
        
        if (fotos != null && !fotos.isEmpty()) {
            List<String> fotoUrls = salvarFotos(fotos, carro.getPlaca());
            carro.setFotos(fotoUrls);
        }
        
        Carro carroSalvo = carroRepository.save(carro);
        
        // Registrar auditoria
        auditoriaService.registrarAcao("CREATE", "CARRO", carroSalvo.getId(), 
                                     usuarioEmail, empresaId, null, carroSalvo, 
                                     "Carro criado");
        
        return converterParaDTO(carroSalvo);
    }
    
    @Transactional
    public CarroDTO atualizarCarro(Long id, CarroDTO carroDTO, List<MultipartFile> novasFotos, 
                                   Long empresaId, String usuarioEmail) {
        Carro carro = carroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carro não encontrado"));
        
        if (!carro.getEmpresa().getId().equals(empresaId)) {
            throw new RuntimeException("Carro não pertence a esta empresa");
        }
        
        // Salvar dados anteriores para auditoria
        CarroDTO dadosAnteriores = converterParaDTO(carro);
        
        if (!carro.getPlaca().equals(carroDTO.getPlaca().toUpperCase()) && 
            carroRepository.existsByPlacaAndEmpresaId(carroDTO.getPlaca().toUpperCase(), empresaId)) {
            throw new RuntimeException("Já existe um carro cadastrado com esta placa nesta empresa");
        }
        
        carro.setPlaca(carroDTO.getPlaca().toUpperCase());
        carro.setQuilometragem(carroDTO.getQuilometragem());
        carro.setModelo(carroDTO.getModelo());
        carro.setMarca(carroDTO.getMarca());
        carro.setObservacoes(carroDTO.getObservacoes());
        
        if (novasFotos != null && !novasFotos.isEmpty()) {
            List<String> fotoUrls = salvarFotos(novasFotos, carro.getPlaca());
            carro.getFotos().addAll(fotoUrls);
        }
        
        Carro carroAtualizado = carroRepository.save(carro);
        
        // Registrar auditoria
        auditoriaService.registrarAcao("UPDATE", "CARRO", carroAtualizado.getId(), 
                                     usuarioEmail, empresaId, dadosAnteriores, 
                                     converterParaDTO(carroAtualizado), 
                                     "Carro atualizado");
        
        return converterParaDTO(carroAtualizado);
    }
    
    @Transactional(readOnly = true)
    public Page<CarroDTO> buscarComFiltros(BuscaCarroDTO buscaDTO, Long empresaId) {
        // Validar empresaId
        if (empresaId == null) {
            throw new RuntimeException("Empresa não encontrada");
        }
        
        // Configurar ordenação com valores padrão
        String ordenarPor = buscaDTO.getOrdenarPor() != null ? buscaDTO.getOrdenarPor() : "dataCadastro";
        String direcao = buscaDTO.getDirecao() != null ? buscaDTO.getDirecao() : "DESC";
        Sort sort = criarSort(ordenarPor, direcao);
        
        // Validar e configurar paginação
        Integer pagina = buscaDTO.getPagina() != null ? buscaDTO.getPagina() : 0;
        Integer tamanho = buscaDTO.getTamanho() != null && buscaDTO.getTamanho() > 0 ? buscaDTO.getTamanho() : 20;
        Pageable pageable = PageRequest.of(pagina, tamanho, sort);
        
        // Normalizar strings de busca (trim e string vazia se null/vazio para evitar problemas de tipo no PostgreSQL)
        String placa = (buscaDTO.getPlaca() != null && !buscaDTO.getPlaca().trim().isEmpty()) 
                ? buscaDTO.getPlaca().trim() : "";
        String modelo = (buscaDTO.getModelo() != null && !buscaDTO.getModelo().trim().isEmpty()) 
                ? buscaDTO.getModelo().trim() : "";
        String marca = (buscaDTO.getMarca() != null && !buscaDTO.getMarca().trim().isEmpty()) 
                ? buscaDTO.getMarca().trim() : "";
        
        // Converter datas se necessário
        java.time.LocalDateTime dataInicio = buscaDTO.getDataInicio();
        java.time.LocalDateTime dataFim = buscaDTO.getDataFim();
        
        Page<Carro> carros = carroRepository.buscarComFiltros(
            empresaId,
            placa,
            modelo,
            marca,
            buscaDTO.getQuilometragemMin(),
            buscaDTO.getQuilometragemMax(),
            dataInicio,
            dataFim,
            pageable
        );
        
        return carros.map(this::converterParaDTO);
    }
    
    @Transactional(readOnly = true)
    public List<CarroDTO> listarTodos(Long empresaId) {
        return carroRepository.findByEmpresaId(empresaId).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public CarroDTO buscarPorId(Long id, Long empresaId) {
        Carro carro = carroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carro não encontrado"));
        
        if (!carro.getEmpresa().getId().equals(empresaId)) {
            throw new RuntimeException("Carro não pertence a esta empresa");
        }
        
        return converterParaDTO(carro);
    }
    
    @Transactional(readOnly = true)
    public CarroDTO buscarPorPlaca(String placa, Long empresaId) {
        Carro carro = carroRepository.findByPlacaAndEmpresaId(placa.toUpperCase(), empresaId)
                .orElseThrow(() -> new RuntimeException("Carro não encontrado"));
        return converterParaDTO(carro);
    }
    
    @Transactional
    public void deletarCarro(Long id, Long empresaId, String usuarioEmail) {
        Carro carro = carroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carro não encontrado"));
        
        if (!carro.getEmpresa().getId().equals(empresaId)) {
            throw new RuntimeException("Carro não pertence a esta empresa");
        }
        
        // Salvar dados para auditoria
        CarroDTO dadosAnteriores = converterParaDTO(carro);
        
        // Deletar fotos do sistema de arquivos
        deletarFotos(carro.getFotos());
        
        carroRepository.delete(carro);
        
        // Registrar auditoria
        auditoriaService.registrarAcao("DELETE", "CARRO", id, usuarioEmail, empresaId, 
                                     dadosAnteriores, null, "Carro deletado");
    }
    
    private Sort criarSort(String ordenarPor, String direcao) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(direcao) ? 
                                   Sort.Direction.ASC : Sort.Direction.DESC;
        
        switch (ordenarPor != null ? ordenarPor.toLowerCase() : "datacadastro") {
            case "quilometragem":
                return Sort.by(direction, "quilometragem");
            case "modelo":
                return Sort.by(direction, "modelo");
            case "marca":
                return Sort.by(direction, "marca");
            case "placa":
                return Sort.by(direction, "placa");
            default:
                return Sort.by(direction, "dataCadastro");
        }
    }
    
    private List<String> salvarFotos(List<MultipartFile> fotos, String placa) {
        return fotos.stream()
                .filter(foto -> !foto.isEmpty())
                .map(foto -> salvarFoto(foto, placa))
                .collect(Collectors.toList());
    }
    
    private String salvarFoto(MultipartFile foto, String placa) {
        try {
            String extensao = foto.getOriginalFilename() != null 
                    ? foto.getOriginalFilename().substring(foto.getOriginalFilename().lastIndexOf("."))
                    : ".jpg";
            String nomeArquivo = placa + "_" + UUID.randomUUID().toString() + extensao;
            Path caminhoArquivo = Paths.get(uploadDir, nomeArquivo);
            
            Files.copy(foto.getInputStream(), caminhoArquivo, StandardCopyOption.REPLACE_EXISTING);
            
            return "/api/carros/fotos/" + nomeArquivo;
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar foto", e);
        }
    }
    
    private void deletarFotos(List<String> fotoUrls) {
        fotoUrls.forEach(url -> {
            try {
                String nomeArquivo = url.substring(url.lastIndexOf("/") + 1);
                Path caminhoArquivo = Paths.get(uploadDir, nomeArquivo);
                Files.deleteIfExists(caminhoArquivo);
            } catch (IOException e) {
                System.err.println("Erro ao deletar foto: " + url);
            }
        });
    }
    
    private CarroDTO converterParaDTO(Carro carro) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        CarroDTO dto = new CarroDTO();
        dto.setId(carro.getId());
        dto.setEmpresaId(carro.getEmpresa() != null ? carro.getEmpresa().getId() : null);
        dto.setEmpresaNome(carro.getEmpresa() != null ? carro.getEmpresa().getNome() : null);
        dto.setPlaca(carro.getPlaca());
        dto.setQuilometragem(carro.getQuilometragem());
        dto.setModelo(carro.getModelo());
        dto.setMarca(carro.getMarca());
        dto.setObservacoes(carro.getObservacoes());
        dto.setFotos(carro.getFotos());
        dto.setDataCadastro(carro.getDataCadastro() != null 
                ? carro.getDataCadastro().format(formatter) 
                : null);
        dto.setDataAtualizacao(carro.getDataAtualizacao() != null 
                ? carro.getDataAtualizacao().format(formatter) 
                : null);
        return dto;
    }
    
    // Métodos públicos para API pública (sem filtro de empresa)
    
    @Transactional(readOnly = true)
    public List<CarroDTO> listarTodosPublico() {
        return carroRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public CarroDTO buscarPorIdPublico(Long id) {
        Carro carro = carroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carro não encontrado"));
        return converterParaDTO(carro);
    }
    
    @Transactional(readOnly = true)
    public CarroDTO buscarPorPlacaPublico(String placa) {
        // Buscar em todas as empresas (primeira ocorrência)
        List<Carro> carros = carroRepository.findAll().stream()
                .filter(c -> c.getPlaca().equalsIgnoreCase(placa))
                .toList();
        
        if (carros.isEmpty()) {
            throw new RuntimeException("Carro não encontrado");
        }
        
        // Retornar o primeiro encontrado
        return converterParaDTO(carros.get(0));
    }
}
