#!/bin/bash

# Script para monitorar desempenho continuamente
# Uso: ./monitor-continuo.sh [intervalo_em_segundos]

INTERVAL=${1:-5}  # Padrão: 5 segundos

echo "Monitorando desempenho a cada $INTERVAL segundos..."
echo "Pressione Ctrl+C para parar"
echo ""

while true; do
    clear
    echo "=========================================="
    echo "MONITOR DE DESEMPENHO - $(date '+%H:%M:%S')"
    echo "=========================================="
    echo ""
    
    # CPU e Memória
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{printf "%.1f%%", 100 - $1}')"
    echo "Memória: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
    echo ""
    
    # Processo Java
    PID=$(pgrep -f "banco-ai" | head -1)
    if [ -n "$PID" ]; then
        CPU=$(ps -p $PID -o %cpu --no-headers | tr -d ' ')
        MEM=$(ps -p $PID -o %mem --no-headers | tr -d ' ')
        RSS=$(ps -p $PID -o rss --no-headers | awk '{printf "%.2f MB", $1/1024}')
        echo "Processo Banco-AI (PID: $PID):"
        echo "  CPU: ${CPU}% | Memória: ${MEM}% (${RSS})"
    fi
    echo ""
    
    # Conexões de banco
    if command -v psql &> /dev/null; then
        CONN=$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'banco_ai';" 2>/dev/null | tr -d ' ')
        if [ -n "$CONN" ]; then
            echo "Conexões PostgreSQL: $CONN"
        fi
    fi
    echo ""
    
    # Conexões de rede
    TCP_CONN=$(netstat -an 2>/dev/null | grep :8080 | grep ESTABLISHED | wc -l)
    echo "Conexões TCP ativas (porta 8080): $TCP_CONN"
    echo ""
    
    sleep $INTERVAL
done

