package com.bancoai.service;

import com.bancoai.dto.BuscaCarroDTO;
import com.bancoai.dto.CarroDTO;
import com.bancoai.model.Carro;
import com.bancoai.model.Empresa;
import com.bancoai.repository.CarroRepository;
import com.bancoai.repository.EmpresaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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
        
        // Buscar todos os carros da empresa primeiro (evita problemas com null)
        List<Carro> todosCarros = carroRepository.findByEmpresaId(empresaId);
        
        // Aplicar filtros em memória (mais simples e evita problemas de tipo SQL)
        List<Carro> carrosFiltrados = todosCarros.stream()
            .filter(carro -> {
                // Filtro por placa
                if (buscaDTO.getPlaca() != null && !buscaDTO.getPlaca().trim().isEmpty()) {
                    String placaBusca = buscaDTO.getPlaca().trim().toUpperCase();
                    if (!carro.getPlaca().toUpperCase().contains(placaBusca)) {
                        return false;
                    }
                }
                
                // Filtro por modelo
                if (buscaDTO.getModelo() != null && !buscaDTO.getModelo().trim().isEmpty()) {
                    String modeloBusca = buscaDTO.getModelo().trim().toUpperCase();
                    if (!carro.getModelo().toUpperCase().contains(modeloBusca)) {
                        return false;
                    }
                }
                
                // Filtro por marca
                if (buscaDTO.getMarca() != null && !buscaDTO.getMarca().trim().isEmpty()) {
                    String marcaBusca = buscaDTO.getMarca().trim().toUpperCase();
                    if (!carro.getMarca().toUpperCase().contains(marcaBusca)) {
                        return false;
                    }
                }
                
                // Filtro por quilometragem mínima
                if (buscaDTO.getQuilometragemMin() != null) {
                    if (carro.getQuilometragem() < buscaDTO.getQuilometragemMin()) {
                        return false;
                    }
                }
                
                // Filtro por quilometragem máxima
                if (buscaDTO.getQuilometragemMax() != null) {
                    if (carro.getQuilometragem() > buscaDTO.getQuilometragemMax()) {
                        return false;
                    }
                }
                
                // Filtro por data início
                if (buscaDTO.getDataInicio() != null) {
                    if (carro.getDataCadastro() == null || carro.getDataCadastro().isBefore(buscaDTO.getDataInicio())) {
                        return false;
                    }
                }
                
                // Filtro por data fim
                if (buscaDTO.getDataFim() != null) {
                    if (carro.getDataCadastro() == null || carro.getDataCadastro().isAfter(buscaDTO.getDataFim())) {
                        return false;
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
        
        // Aplicar ordenação
        String ordenarPor = buscaDTO.getOrdenarPor() != null ? buscaDTO.getOrdenarPor() : "dataCadastro";
        String direcao = buscaDTO.getDirecao() != null ? buscaDTO.getDirecao() : "DESC";
        
        carrosFiltrados.sort((c1, c2) -> {
            int resultado = 0;
            switch (ordenarPor.toLowerCase()) {
                case "quilometragem":
                    resultado = c1.getQuilometragem().compareTo(c2.getQuilometragem());
                    break;
                case "modelo":
                    resultado = c1.getModelo().compareToIgnoreCase(c2.getModelo());
                    break;
                case "marca":
                    resultado = c1.getMarca().compareToIgnoreCase(c2.getMarca());
                    break;
                case "placa":
                    resultado = c1.getPlaca().compareToIgnoreCase(c2.getPlaca());
                    break;
                default: // dataCadastro
                    if (c1.getDataCadastro() != null && c2.getDataCadastro() != null) {
                        resultado = c1.getDataCadastro().compareTo(c2.getDataCadastro());
                    }
                    break;
            }
            return "DESC".equalsIgnoreCase(direcao) ? -resultado : resultado;
        });
        
        // Aplicar paginação
        Integer pagina = buscaDTO.getPagina() != null ? buscaDTO.getPagina() : 0;
        Integer tamanho = buscaDTO.getTamanho() != null && buscaDTO.getTamanho() > 0 ? buscaDTO.getTamanho() : 20;
        
        int inicio = pagina * tamanho;
        int fim = Math.min(inicio + tamanho, carrosFiltrados.size());
        List<Carro> carrosPaginados = inicio < carrosFiltrados.size() 
            ? carrosFiltrados.subList(inicio, fim) 
            : List.of();
        
        // Converter para DTO
        List<CarroDTO> carrosDTO = carrosPaginados.stream()
            .map(this::converterParaDTO)
            .collect(Collectors.toList());
        
        return new PageImpl<>(carrosDTO, PageRequest.of(pagina, tamanho), carrosFiltrados.size());
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
