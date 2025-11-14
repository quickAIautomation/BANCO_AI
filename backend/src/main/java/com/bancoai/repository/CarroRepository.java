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
    
    // Query otimizada para busca com filtros (evita carregar tudo em memória)
    // Usando JPQL que funciona melhor com parâmetros NULL
    @Query("SELECT c FROM Carro c WHERE c.empresa.id = :empresaId " +
           "AND (:placa IS NULL OR UPPER(c.placa) LIKE CONCAT('%', UPPER(:placa), '%')) " +
           "AND (:modelo IS NULL OR UPPER(c.modelo) LIKE CONCAT('%', UPPER(:modelo), '%')) " +
           "AND (:marca IS NULL OR UPPER(c.marca) LIKE CONCAT('%', UPPER(:marca), '%')) " +
           "AND (:quilometragemMin IS NULL OR c.quilometragem >= :quilometragemMin) " +
           "AND (:quilometragemMax IS NULL OR c.quilometragem <= :quilometragemMax) " +
           "AND (:valorMin IS NULL OR c.valor >= :valorMin) " +
           "AND (:valorMax IS NULL OR c.valor <= :valorMax) " +
           "AND (:dataInicio IS NULL OR c.dataCadastro >= :dataInicio) " +
           "AND (:dataFim IS NULL OR c.dataCadastro <= :dataFim) " +
           "ORDER BY c.dataCadastro DESC")
    Page<Carro> buscarComFiltros(@Param("empresaId") Long empresaId,
                                  @Param("placa") String placa,
                                  @Param("modelo") String modelo,
                                  @Param("marca") String marca,
                                  @Param("quilometragemMin") Integer quilometragemMin,
                                  @Param("quilometragemMax") Integer quilometragemMax,
                                  @Param("valorMin") java.math.BigDecimal valorMin,
                                  @Param("valorMax") java.math.BigDecimal valorMax,
                                  @Param("dataInicio") java.time.LocalDateTime dataInicio,
                                  @Param("dataFim") java.time.LocalDateTime dataFim,
                                  Pageable pageable);
    
    // Busca otimizada por placa (sem carregar todos os carros)
    @Query("SELECT c FROM Carro c WHERE UPPER(c.placa) = UPPER(:placa) ORDER BY c.dataCadastro DESC")
    List<Carro> findByPlacaIgnoreCase(@Param("placa") String placa, Pageable pageable);
}

