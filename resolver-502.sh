#!/bin/bash

echo "=========================================="
echo "RESOLVER ERRO 502 BAD GATEWAY"
echo "=========================================="
echo ""

echo "1. Verificando status do serviço backend..."
echo "----------------------------------------"
sudo systemctl status banco-ai.service --no-pager | head -15
echo ""

echo "2. Verificando se o processo Java está rodando..."
echo "----------------------------------------"
ps aux | grep -i "banco-ai" | grep -v grep
echo ""

echo "3. Verificando se a porta 8080 está em uso..."
echo "----------------------------------------"
sudo netstat -tlnp | grep :8080 || echo "Porta 8080 não está em uso!"
echo ""

echo "4. Testando conexão direta com o backend..."
echo "----------------------------------------"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080/api/auth/login || echo "Backend não está respondendo!"
echo ""

echo "5. Verificando logs recentes do serviço..."
echo "----------------------------------------"
sudo journalctl -u banco-ai.service -n 30 --no-pager | tail -20
echo ""

echo "=========================================="
echo "COMANDOS PARA RESOLVER:"
echo "=========================================="
echo ""
echo "Se o serviço estiver parado:"
echo "  sudo systemctl start banco-ai.service"
echo ""
echo "Se o serviço estiver travado:"
echo "  sudo systemctl restart banco-ai.service"
echo ""
echo "Se precisar ver logs em tempo real:"
echo "  sudo journalctl -u banco-ai.service -f"
echo ""
echo "Se precisar matar o processo manualmente:"
echo "  sudo pkill -f banco-ai"
echo "  sudo systemctl start banco-ai.service"
echo ""
echo "Verificar uso de memória/CPU:"
echo "  ./diagnostico-desempenho.sh"
echo ""

