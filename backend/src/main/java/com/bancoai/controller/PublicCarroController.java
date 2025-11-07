package com.bancoai.controller;

import com.bancoai.dto.CarroDTO;
import com.bancoai.service.CarroService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/carros")
@CrossOrigin(origins = "*")
public class PublicCarroController {
    
    private final CarroService carroService;
    
    @Value("${server.port:8080}")
    private int serverPort;
    
    public PublicCarroController(CarroService carroService) {
        this.carroService = carroService;
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
     * Acessível via HTTP request sem autenticação
     * 
     * Exemplo de uso no n8n:
     * GET http://localhost:8080/api/public/carros
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
     * 
     * Exemplo de uso no n8n:
     * GET http://localhost:8080/api/public/carros/1
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
     * 
     * Exemplo de uso no n8n:
     * GET http://localhost:8080/api/public/carros/placa/ABC1234
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

