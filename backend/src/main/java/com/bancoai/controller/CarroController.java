package com.bancoai.controller;

import com.bancoai.dto.BuscaCarroDTO;
import com.bancoai.dto.CarroDTO;
import com.bancoai.service.CarroService;
import com.bancoai.service.UsuarioService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/carros")
@CrossOrigin(origins = "http://localhost:3000")
public class CarroController {
    
    private final CarroService carroService;
    private final UsuarioService usuarioService;
    
    public CarroController(CarroService carroService, UsuarioService usuarioService) {
        this.carroService = carroService;
        this.usuarioService = usuarioService;
    }
    
    private Long obterEmpresaId(Authentication authentication) {
        String email = authentication.getName();
        return usuarioService.obterUsuarioCompleto(email).getEmpresa().getId();
    }
    
    private Long obterEmpresaIdParaFiltro(Authentication authentication, Long empresaIdSelecionada) {
        String email = authentication.getName();
        // Se for admin e tiver selecionado uma empresa, usar a selecionada
        if (usuarioService.isAdmin(email) && empresaIdSelecionada != null) {
            return empresaIdSelecionada;
        }
        // Caso contrário, usar a empresa do usuário
        return obterEmpresaId(authentication);
    }
    
    @PostMapping
    public ResponseEntity<CarroDTO> criarCarro(
            @RequestPart("carro") CarroDTO carroDTO,
            @RequestPart(value = "fotos", required = false) List<MultipartFile> fotos,
            @RequestParam(value = "empresaId", required = false) Long empresaIdSelecionada,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            if (!usuarioService.podeCriar(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Long empresaId = obterEmpresaIdParaFiltro(authentication, empresaIdSelecionada);
            String usuarioEmail = authentication.getName();
            CarroDTO carroCriado = carroService.criarCarro(carroDTO, fotos, empresaId, usuarioEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(carroCriado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<CarroDTO>> listarTodos(
            @RequestParam(value = "empresaId", required = false) Long empresaIdSelecionada,
            Authentication authentication) {
        try {
            Long empresaId = obterEmpresaIdParaFiltro(authentication, empresaIdSelecionada);
            List<CarroDTO> carros = carroService.listarTodos(empresaId);
            return ResponseEntity.ok(carros);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/buscar")
    public ResponseEntity<Page<CarroDTO>> buscarComFiltros(
            @RequestBody BuscaCarroDTO buscaDTO,
            @RequestParam(value = "empresaId", required = false) Long empresaIdSelecionada,
            Authentication authentication) {
        try {
            Long empresaId = obterEmpresaIdParaFiltro(authentication, empresaIdSelecionada);
            Page<CarroDTO> carros = carroService.buscarComFiltros(buscaDTO, empresaId);
            return ResponseEntity.ok(carros);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CarroDTO> buscarPorId(
            @PathVariable Long id,
            @RequestParam(value = "empresaId", required = false) Long empresaIdSelecionada,
            Authentication authentication) {
        try {
            Long empresaId = obterEmpresaIdParaFiltro(authentication, empresaIdSelecionada);
            CarroDTO carro = carroService.buscarPorId(id, empresaId);
            return ResponseEntity.ok(carro);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CarroDTO> atualizarCarro(
            @PathVariable Long id,
            @RequestPart("carro") CarroDTO carroDTO,
            @RequestPart(value = "fotos", required = false) List<MultipartFile> novasFotos,
            @RequestParam(value = "empresaId", required = false) Long empresaIdSelecionada,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            if (!usuarioService.podeEditar(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Long empresaId = obterEmpresaIdParaFiltro(authentication, empresaIdSelecionada);
            String usuarioEmail = authentication.getName();
            CarroDTO carroAtualizado = carroService.atualizarCarro(id, carroDTO, novasFotos, empresaId, usuarioEmail);
            return ResponseEntity.ok(carroAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCarro(
            @PathVariable Long id,
            @RequestParam(value = "empresaId", required = false) Long empresaIdSelecionada,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            if (!usuarioService.podeDeletar(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Long empresaId = obterEmpresaIdParaFiltro(authentication, empresaIdSelecionada);
            String usuarioEmail = authentication.getName();
            carroService.deletarCarro(id, empresaId, usuarioEmail);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

