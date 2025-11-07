package com.bancoai.controller;

import com.bancoai.dto.BuscaCarroDTO;
import com.bancoai.dto.CarroDTO;
import com.bancoai.service.CarroService;
import com.bancoai.service.UsuarioService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/carros")
@CrossOrigin(origins = "http://localhost:3000")
public class CarroController {
    
    private final CarroService carroService;
    private final UsuarioService usuarioService;
    private final String uploadDir = "uploads/carros";
    
    public CarroController(CarroService carroService, UsuarioService usuarioService) {
        this.carroService = carroService;
        this.usuarioService = usuarioService;
    }
    
    private Long obterEmpresaId(Authentication authentication) {
        String email = authentication.getName();
        return usuarioService.obterUsuarioCompleto(email).getEmpresa().getId();
    }
    
    @PostMapping
    public ResponseEntity<CarroDTO> criarCarro(
            @RequestPart("carro") CarroDTO carroDTO,
            @RequestPart(value = "fotos", required = false) List<MultipartFile> fotos,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            if (!usuarioService.podeCriar(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Long empresaId = obterEmpresaId(authentication);
            String usuarioEmail = authentication.getName();
            CarroDTO carroCriado = carroService.criarCarro(carroDTO, fotos, empresaId, usuarioEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(carroCriado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<CarroDTO>> listarTodos(Authentication authentication) {
        try {
            Long empresaId = obterEmpresaId(authentication);
            List<CarroDTO> carros = carroService.listarTodos(empresaId);
            return ResponseEntity.ok(carros);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/buscar")
    public ResponseEntity<Page<CarroDTO>> buscarComFiltros(
            @RequestBody BuscaCarroDTO buscaDTO,
            Authentication authentication) {
        try {
            Long empresaId = obterEmpresaId(authentication);
            Page<CarroDTO> carros = carroService.buscarComFiltros(buscaDTO, empresaId);
            return ResponseEntity.ok(carros);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CarroDTO> buscarPorId(@PathVariable Long id, Authentication authentication) {
        try {
            Long empresaId = obterEmpresaId(authentication);
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
            Authentication authentication) {
        try {
            String email = authentication.getName();
            if (!usuarioService.podeEditar(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Long empresaId = obterEmpresaId(authentication);
            String usuarioEmail = authentication.getName();
            CarroDTO carroAtualizado = carroService.atualizarCarro(id, carroDTO, novasFotos, empresaId, usuarioEmail);
            return ResponseEntity.ok(carroAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCarro(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            if (!usuarioService.podeDeletar(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Long empresaId = obterEmpresaId(authentication);
            String usuarioEmail = authentication.getName();
            carroService.deletarCarro(id, empresaId, usuarioEmail);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/fotos/{nomeArquivo}")
    public ResponseEntity<Resource> obterFoto(@PathVariable String nomeArquivo) {
        try {
            Path caminhoArquivo = Paths.get(uploadDir).resolve(nomeArquivo).normalize();
            Resource resource = new UrlResource(caminhoArquivo.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                // Detectar o tipo de conteúdo automaticamente
                String contentType = Files.probeContentType(caminhoArquivo);
                if (contentType == null || !contentType.startsWith("image/")) {
                    // Fallback para JPEG se não conseguir detectar
                    contentType = MediaType.IMAGE_JPEG_VALUE;
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nomeArquivo + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

