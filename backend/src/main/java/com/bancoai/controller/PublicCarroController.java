package com.bancoai.controller;

import com.bancoai.dto.CarroDTO;
import com.bancoai.service.CarroService;
import com.bancoai.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/carros")
@CrossOrigin(origins = "*")
public class PublicCarroController {
    
    private final CarroService carroService;
    private final UsuarioService usuarioService;
    
    @Value("${server.port:8080}")
    private int serverPort;
    
    public PublicCarroController(CarroService carroService, UsuarioService usuarioService) {
        this.carroService = carroService;
        this.usuarioService = usuarioService;
    }
    
    /**
     * Obtém a URL base do servidor dinamicamente
     */
    private String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme(); // http ou https
        String serverName = request.getServerName(); // localhost ou domínio
        int port = request.getServerPort(); // porta do servidor
        
        if ((scheme.equals("http") && port == 80) || (scheme.equals("https") && port == 443)) {
            return scheme + "://" + serverName;
        } else {
            return scheme + "://" + serverName + ":" + port;
        }
    }
    
    /**
     * Endpoint público para listar todos os carros com todas as informações
     * Requer autenticação via X-API-Key no header
     * 
     * Exemplo de uso no n8n:
     * GET http://localhost:8080/api/public/carros
     * Header: X-API-Key: sua_chave_api_aqui
     * 
     * @param request HttpServletRequest para obter a URL base
     * @return Lista de todos os carros com informações completas
     */
    @GetMapping
    public ResponseEntity<List<CarroDTO>> listarTodosCarros(HttpServletRequest request) {
        // API pública retorna todos os carros de todas as empresas
        List<CarroDTO> carros = carroService.listarTodosPublico();
        String baseUrl = getBaseUrl(request);
        
        // Converter URLs relativas das fotos para URLs absolutas
        List<CarroDTO> carrosComUrlsCompletas = carros.stream()
                .map(carro -> adicionarUrlsCompletas(carro, baseUrl))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(carrosComUrlsCompletas);
    }
    
    /**
     * Endpoint público para buscar um carro específico por ID
     * Requer autenticação via X-API-Key no header
     * 
     * Exemplo de uso no n8n:
     * GET http://localhost:8080/api/public/carros/1
     * Header: X-API-Key: sua_chave_api_aqui
     * 
     * @param id ID do carro
     * @param request HttpServletRequest para obter a URL base
     * @return Dados completos do carro
     */
    @GetMapping("/{id}")
    public ResponseEntity<CarroDTO> buscarCarroPorId(@PathVariable Long id, HttpServletRequest request) {
        try {
            CarroDTO carro = carroService.buscarPorIdPublico(id);
            String baseUrl = getBaseUrl(request);
            CarroDTO carroComUrlsCompletas = adicionarUrlsCompletas(carro, baseUrl);
            return ResponseEntity.ok(carroComUrlsCompletas);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Endpoint público para buscar carro por placa
     * Requer autenticação via X-API-Key no header
     * 
     * Exemplo de uso no n8n:
     * GET http://localhost:8080/api/public/carros/placa/ABC1234
     * Header: X-API-Key: sua_chave_api_aqui
     * 
     * @param placa Placa do carro
     * @param request HttpServletRequest para obter a URL base
     * @return Dados completos do carro
     */
    @GetMapping("/placa/{placa}")
    public ResponseEntity<CarroDTO> buscarCarroPorPlaca(@PathVariable String placa, HttpServletRequest request) {
        try {
            CarroDTO carro = carroService.buscarPorPlacaPublico(placa.toUpperCase());
            String baseUrl = getBaseUrl(request);
            CarroDTO carroComUrlsCompletas = adicionarUrlsCompletas(carro, baseUrl);
            return ResponseEntity.ok(carroComUrlsCompletas);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Endpoint público para criar um novo carro
     * Requer autenticação via X-API-Key no header
     * O carro será criado na empresa do usuário autenticado
     * 
     * Exemplo de uso no n8n:
     * POST http://localhost:8080/api/public/carros
     * Header: X-API-Key: sua_chave_api_aqui
     * Content-Type: application/json
     * Body: {
     *   "placa": "ABC-1234",
     *   "quilometragem": 50000,
     *   "modelo": "Corolla",
     *   "marca": "Toyota",
     *   "observacoes": "Carro em bom estado"
     * }
     * 
     * @param carroDTO Dados do carro a ser criado
     * @param authentication Autenticação do usuário via API Key
     * @param request HttpServletRequest para obter a URL base
     * @return Carro criado com informações completas
     */
    @PostMapping
    public ResponseEntity<?> criarCarro(
            @Valid @RequestBody CarroDTO carroDTO,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            // Verificar se o usuário tem permissão para criar
            String usuarioEmail = authentication.getName();
            if (!usuarioService.podeCriar(usuarioEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Você não tem permissão para criar carros");
            }
            
            // Obter empresa do usuário autenticado
            Long empresaId = usuarioService.obterUsuarioCompleto(usuarioEmail).getEmpresa().getId();
            
            // Criar carro (sem fotos inicialmente - pode ser adicionado depois via endpoint de atualização)
            CarroDTO carroCriado = carroService.criarCarro(carroDTO, null, empresaId, usuarioEmail);
            
            // Adicionar URLs completas das fotos
            String baseUrl = getBaseUrl(request);
            carroCriado = adicionarUrlsCompletas(carroCriado, baseUrl);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(carroCriado);
        } catch (RuntimeException e) {
            System.err.println("Erro ao criar carro via API pública: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erro ao criar carro: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Erro inesperado ao criar carro via API pública: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro inesperado ao criar carro: " + e.getMessage());
        }
    }
    
    /**
     * Converte URLs relativas das fotos para URLs absolutas
     */
    private CarroDTO adicionarUrlsCompletas(CarroDTO carro, String baseUrl) {
        if (carro.getFotos() != null && !carro.getFotos().isEmpty()) {
            List<String> fotosCompletas = carro.getFotos().stream()
                    .map(foto -> {
                        if (foto.startsWith("http")) {
                            return foto; // Já é uma URL completa
                        } else if (foto.startsWith("/")) {
                            return baseUrl + foto; // URL relativa
                        } else {
                            return baseUrl + "/api/carros/fotos/" + foto; // Apenas nome do arquivo
                        }
                    })
                    .collect(Collectors.toList());
            carro.setFotos(fotosCompletas);
        }
        return carro;
    }
}

