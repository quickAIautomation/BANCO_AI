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
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarroService {
    
    private final CarroRepository carroRepository;
    private final EmpresaRepository empresaRepository;
    private final AuditoriaService auditoriaService;
    
    public CarroService(CarroRepository carroRepository, 
                       EmpresaRepository empresaRepository,
                       AuditoriaService auditoriaService) {
        this.carroRepository = carroRepository;
        this.empresaRepository = empresaRepository;
        this.auditoriaService = auditoriaService;
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
            List<String> fotosBase64 = converterFotosParaBase64(fotos);
            carro.setFotos(fotosBase64);
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
            List<String> fotosBase64 = converterFotosParaBase64(novasFotos);
            carro.getFotos().addAll(fotosBase64);
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
        // Configurar ordenação
        Sort sort = criarSort(buscaDTO.getOrdenarPor(), buscaDTO.getDirecao());
        Pageable pageable = PageRequest.of(buscaDTO.getPagina(), buscaDTO.getTamanho(), sort);
        
        // Converter datas se necessário
        java.time.LocalDateTime dataInicio = buscaDTO.getDataInicio();
        java.time.LocalDateTime dataFim = buscaDTO.getDataFim();
        
        Page<Carro> carros = carroRepository.buscarComFiltros(
            empresaId,
            buscaDTO.getPlaca(),
            buscaDTO.getModelo(),
            buscaDTO.getMarca(),
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
    
    private List<String> converterFotosParaBase64(List<MultipartFile> fotos) {
        return fotos.stream()
                .filter(foto -> !foto.isEmpty())
                .map(this::converterFotoParaBase64)
                .collect(Collectors.toList());
    }
    
    private String converterFotoParaBase64(MultipartFile foto) {
        try {
            byte[] bytes = foto.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            
            // Detectar o tipo MIME da imagem
            String contentType = foto.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                contentType = "image/jpeg"; // Fallback para JPEG
            }
            
            // Retornar base64 com prefixo data URI
            return "data:" + contentType + ";base64," + base64;
        } catch (IOException e) {
            throw new RuntimeException("Erro ao converter foto para base64", e);
        }
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
