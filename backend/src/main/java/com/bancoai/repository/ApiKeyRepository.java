package com.bancoai.repository;

import com.bancoai.model.ApiKey;
import com.bancoai.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    Optional<ApiKey> findByChave(String chave);
    List<ApiKey> findByUsuarioAndAtivaTrue(Usuario usuario);
    List<ApiKey> findByUsuario(Usuario usuario);
    boolean existsByChave(String chave);
}

