package com.bancoai.repository;

import com.bancoai.model.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
    List<Auditoria> findByEntidadeAndEntidadeIdOrderByDataAcaoDesc(String entidade, Long entidadeId);
    List<Auditoria> findByEmpresaIdOrderByDataAcaoDesc(Long empresaId);
    List<Auditoria> findByUsuarioEmailOrderByDataAcaoDesc(String usuarioEmail);
    
    @Query("SELECT a FROM Auditoria a WHERE a.empresaId = :empresaId AND a.dataAcao BETWEEN :dataInicio AND :dataFim ORDER BY a.dataAcao DESC")
    List<Auditoria> findByEmpresaIdAndPeriodo(@Param("empresaId") Long empresaId, 
                                               @Param("dataInicio") LocalDateTime dataInicio, 
                                               @Param("dataFim") LocalDateTime dataFim);
}

