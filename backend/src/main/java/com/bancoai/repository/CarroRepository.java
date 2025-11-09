package com.bancoai.repository;

import com.bancoai.model.Carro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarroRepository extends JpaRepository<Carro, Long> {
    Optional<Carro> findByPlacaAndEmpresaId(String placa, Long empresaId);
    boolean existsByPlacaAndEmpresaId(String placa, Long empresaId);
    
    // Busca por empresa
    List<Carro> findByEmpresaId(Long empresaId);
    Page<Carro> findByEmpresaId(Long empresaId, Pageable pageable);
    
    // Busca avançada
    @Query("SELECT c FROM Carro c WHERE c.empresa.id = :empresaId " +
           "AND (:placa IS NULL OR UPPER(c.placa) LIKE UPPER(CONCAT('%', :placa, '%'))) " +
           "AND (:modelo IS NULL OR UPPER(c.modelo) LIKE UPPER(CONCAT('%', :modelo, '%'))) " +
           "AND (:marca IS NULL OR UPPER(c.marca) LIKE UPPER(CONCAT('%', :marca, '%'))) " +
           "AND (:quilometragemMin IS NULL OR c.quilometragem >= :quilometragemMin) " +
           "AND (:quilometragemMax IS NULL OR c.quilometragem <= :quilometragemMax) " +
           "AND (:dataInicio IS NULL OR c.dataCadastro >= :dataInicio) " +
           "AND (:dataFim IS NULL OR c.dataCadastro <= :dataFim)")
    Page<Carro> buscarComFiltros(@Param("empresaId") Long empresaId,
                                  @Param("placa") String placa,
                                  @Param("modelo") String modelo,
                                  @Param("marca") String marca,
                                  @Param("quilometragemMin") Integer quilometragemMin,
                                  @Param("quilometragemMax") Integer quilometragemMax,
                                  @Param("dataInicio") LocalDateTime dataInicio,
                                  @Param("dataFim") LocalDateTime dataFim,
                                  Pageable pageable);
    
    // Estatísticas
    @Query("SELECT COUNT(c) FROM Carro c WHERE c.empresa.id = :empresaId")
    Long countByEmpresaId(@Param("empresaId") Long empresaId);
    
    @Query("SELECT c.marca, COUNT(c) FROM Carro c WHERE c.empresa.id = :empresaId GROUP BY c.marca")
    List<Object[]> countByMarca(@Param("empresaId") Long empresaId);
}

