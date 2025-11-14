#!/bin/bash

echo "=========================================="
echo "DIAGNÓSTICO DE DESEMPENHO - BANCO AI"
echo "=========================================="
echo ""

echo "1. USO DE RECURSOS DO SISTEMA"
echo "-----------------------------"
echo "CPU:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"% em uso"}'
echo ""
echo "Memória:"
free -h | grep Mem | awk '{print "Total: " $2 " | Usado: " $3 " | Livre: " $4 " | Disponível: " $7}'
echo ""

echo "2. PROCESSOS JAVA/SPRING BOOT"
echo "-----------------------------"
ps aux | grep -i java | grep -v grep | awk '{print "PID: " $2 " | CPU: " $3 "% | MEM: " $4 "% | Comando: " $11 " " $12 " " $13}'
echo ""

echo "3. USO DE MEMÓRIA PELO PROCESSO BANCO-AI"
echo "-----------------------------"
PID=$(pgrep -f "banco-ai" | head -1)
if [ -n "$PID" ]; then
    echo "PID encontrado: $PID"
    ps -p $PID -o pid,vsz,rss,%mem,%cpu,cmd
    echo ""
    echo "Threads:"
    ps -p $PID -o nlwp
    echo ""
    echo "Uso de memória detalhado:"
    cat /proc/$PID/status | grep -E "VmSize|VmRSS|VmData|VmStk|VmExe|VmLib"
else
    echo "Processo banco-ai não encontrado"
fi
echo ""

echo "4. CONEXÕES DE BANCO DE DADOS (PostgreSQL)"
echo "-----------------------------"
if command -v psql &> /dev/null; then
    echo "Conexões ativas:"
    sudo -u postgres psql -c "SELECT count(*) as total_connections FROM pg_stat_activity;" 2>/dev/null || echo "Não foi possível verificar conexões"
    echo ""
    echo "Conexões por estado:"
    sudo -u postgres psql -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;" 2>/dev/null || echo "Não foi possível verificar estados"
    echo ""
    echo "Queries mais lentas:"
    sudo -u postgres psql -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds' AND state = 'active';" 2>/dev/null || echo "Não foi possível verificar queries lentas"
else
    echo "psql não encontrado"
fi
echo ""

echo "5. ESPAÇO EM DISCO"
echo "-----------------------------"
df -h | grep -E "^/dev|Filesystem"
echo ""

echo "6. LOGS RECENTES DO SYSTEMD"
echo "-----------------------------"
if systemctl is-active --quiet banco-ai.service; then
    echo "Últimas 20 linhas do log:"
    journalctl -u banco-ai.service -n 20 --no-pager | tail -20
else
    echo "Serviço banco-ai não está ativo"
fi
echo ""

echo "7. ERROS RECENTES NO LOG"
echo "-----------------------------"
if [ -f "/var/log/banco-ai/application.log" ]; then
    echo "Últimos erros:"
    tail -50 /var/log/banco-ai/application.log | grep -i "error\|exception\|timeout" | tail -10
elif [ -f "logs/application.log" ]; then
    echo "Últimos erros:"
    tail -50 logs/application.log | grep -i "error\|exception\|timeout" | tail -10
else
    echo "Arquivo de log não encontrado"
fi
echo ""

echo "8. CONEXÕES DE REDE"
echo "-----------------------------"
echo "Conexões TCP ativas na porta 8080:"
netstat -an | grep :8080 | wc -l
echo ""
echo "Conexões estabelecidas:"
netstat -an | grep :8080 | grep ESTABLISHED | wc -l
echo ""

echo "=========================================="
echo "DIAGNÓSTICO CONCLUÍDO"
echo "=========================================="

