package com.bancoai.controller;

import com.bancoai.dto.CarroDTO;
import com.bancoai.service.CarroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/carros")
@CrossOrigin(origins = "*")
public class PublicCarroController {
    
    private final CarroService carroService;
    
    public PublicCarroController(CarroService carroService) {
        this.carroService = carroService;
    }
    
    /**
     * Endpoint público para listar todos os carros com todas as informações
     * Requer autenticação via X-API-Key no header
     * 
     * Exemplo de uso no n8n:
     * GET http://localhost:8080/api/public/carros
     * Header: X-API-Key: sua_chave_api_aqui
     * 
     * @return Lista de todos os carros com informações completas (fotos em base64)
     */
    @GetMapping
    public ResponseEntity<List<CarroDTO>> listarTodosCarros() {
        // API pública retorna todos os carros de todas as empresas
        // As fotos já vêm como base64 do banco de dados
        List<CarroDTO> carros = carroService.listarTodosPublico();
        return ResponseEntity.ok(carros);
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
     * @return Dados completos do carro (fotos em base64)
     */
    @GetMapping("/{id}")
    public ResponseEntity<CarroDTO> buscarCarroPorId(@PathVariable Long id) {
        try {
            CarroDTO carro = carroService.buscarPorIdPublico(id);
            // As fotos já vêm como base64 do banco de dados
            return ResponseEntity.ok(carro);
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
     * @return Dados completos do carro (fotos em base64)
     */
    @GetMapping("/placa/{placa}")
    public ResponseEntity<CarroDTO> buscarCarroPorPlaca(@PathVariable String placa) {
        try {
            CarroDTO carro = carroService.buscarPorPlacaPublico(placa.toUpperCase());
            // As fotos já vêm como base64 do banco de dados
            return ResponseEntity.ok(carro);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

