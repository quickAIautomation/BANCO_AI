package com.bancoai.repository;

import com.bancoai.model.Usuario;
import com.bancoai.model.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    
    List<Usuario> findByEmpresaId(Long empresaId);
    List<Usuario> findByEmpresaIdAndAtivoTrue(Long empresaId);
    List<Usuario> findByEmpresaIdAndRole(Long empresaId, Role role);
    
    // Busca avançada com filtros
    @Query("SELECT u FROM Usuario u WHERE " +
           "(:nome IS NULL OR UPPER(u.nome) LIKE UPPER(CONCAT('%', :nome, '%'))) " +
           "AND (:email IS NULL OR UPPER(u.email) LIKE UPPER(CONCAT('%', :email, '%'))) " +
           "AND (:empresaId IS NULL OR u.empresa.id = :empresaId) " +
           "AND (:role IS NULL OR u.role = :role) " +
           "AND (:ativo IS NULL OR u.ativo = :ativo)")
    Page<Usuario> buscarComFiltros(@Param("nome") String nome,
                                    @Param("email") String email,
                                    @Param("empresaId") Long empresaId,
                                    @Param("role") Role role,
                                    @Param("ativo") Boolean ativo,
                                    Pageable pageable);
}

