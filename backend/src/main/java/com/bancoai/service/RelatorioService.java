package com.bancoai.service;

import com.bancoai.dto.RelatorioDTO;
import com.bancoai.repository.CarroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RelatorioService {
    
    private final CarroRepository carroRepository;
    
    public RelatorioService(CarroRepository carroRepository) {
        this.carroRepository = carroRepository;
    }
    
    @Transactional(readOnly = true)
    public RelatorioDTO gerarRelatorio(Long empresaId) {
        RelatorioDTO relatorio = new RelatorioDTO();
        
        // Total de carros
        Long totalCarros = carroRepository.countByEmpresaId(empresaId);
        relatorio.setTotalCarros(totalCarros);
        
        // Carros por marca
        List<Object[]> carrosPorMarca = carroRepository.countByMarca(empresaId);
        List<Map<String, Object>> marcaData = new ArrayList<>();
        
        for (Object[] row : carrosPorMarca) {
            Map<String, Object> item = new HashMap<>();
            item.put("marca", row[0]);
            item.put("quantidade", row[1]);
            marcaData.add(item);
        }
        
        relatorio.setCarrosPorMarca(marcaData);
        relatorio.setTotalPorMarca((long) marcaData.size());
        
        // Evolução de cadastros (simplificado - pode ser expandido)
        relatorio.setEvolucaoCadastros(new ArrayList<>());
        
        return relatorio;
    }
}

