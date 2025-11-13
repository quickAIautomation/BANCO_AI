package com.bancoai.repository;

import com.bancoai.model.Carro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarroRepository extends JpaRepository<Carro, Long> {
    Optional<Carro> findByPlacaAndEmpresaId(String placa, Long empresaId);
    boolean existsByPlacaAndEmpresaId(String placa, Long empresaId);
    
    // Busca por empresa
    List<Carro> findByEmpresaId(Long empresaId);
    Page<Carro> findByEmpresaId(Long empresaId, Pageable pageable);
    
    // Método base para buscar por empresa - será usado pelo service para construir query dinâmica
    List<Carro> findByEmpresaIdOrderByDataCadastroDesc(Long empresaId);
    
    // Estatísticas
    @Query("SELECT COUNT(c) FROM Carro c WHERE c.empresa.id = :empresaId")
    Long countByEmpresaId(@Param("empresaId") Long empresaId);
    
    @Query("SELECT c.marca, COUNT(c) FROM Carro c WHERE c.empresa.id = :empresaId GROUP BY c.marca")
    List<Object[]> countByMarca(@Param("empresaId") Long empresaId);
}

