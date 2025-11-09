package com.bancoai.repository;

import com.bancoai.model.Empresa;
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
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByNome(String nome);
    List<Empresa> findByAtivaTrue();
    boolean existsByNome(String nome);
    
    // Busca avançada com filtros
    @Query("SELECT e FROM Empresa e WHERE " +
           "(:nome IS NULL OR UPPER(e.nome) LIKE UPPER(CONCAT('%', :nome, '%'))) " +
           "AND (:cnpj IS NULL OR UPPER(e.cnpj) LIKE UPPER(CONCAT('%', :cnpj, '%'))) " +
           "AND (:email IS NULL OR UPPER(e.email) LIKE UPPER(CONCAT('%', :email, '%'))) " +
           "AND (:ativa IS NULL OR e.ativa = :ativa) " +
           "AND (:dataInicio IS NULL OR e.dataCadastro >= :dataInicio) " +
           "AND (:dataFim IS NULL OR e.dataCadastro <= :dataFim)")
    Page<Empresa> buscarComFiltros(@Param("nome") String nome,
                                    @Param("cnpj") String cnpj,
                                    @Param("email") String email,
                                    @Param("ativa") Boolean ativa,
                                    @Param("dataInicio") LocalDateTime dataInicio,
                                    @Param("dataFim") LocalDateTime dataFim,
                                    Pageable pageable);
}

