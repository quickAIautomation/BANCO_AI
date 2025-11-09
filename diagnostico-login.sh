#!/bin/bash

echo "=========================================="
echo "🔍 DIAGNÓSTICO COMPLETO - LOGIN BANCO AI"
echo "=========================================="
echo ""

# 1. Verificar backend
echo "1️⃣ Verificando Backend..."
echo "----------------------------------------"
sudo systemctl status banco-ai --no-pager | head -10
echo ""

# 2. Verificar se backend está respondendo
echo "2️⃣ Testando API diretamente (localhost:8080)..."
echo "----------------------------------------"
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bancoai.com","senha":"admin123"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""

# 3. Verificar se Nginx está fazendo proxy
echo "3️⃣ Testando API através do Nginx (bancoai.com.br)..."
echo "----------------------------------------"
curl -X POST https://bancoai.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bancoai.com","senha":"admin123"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s \
  -k
echo ""

# 4. Verificar .env.production do frontend
echo "4️⃣ Verificando .env.production do frontend..."
echo "----------------------------------------"
if [ -f /var/www/banco-ai/frontend/.env.production ]; then
    echo "✅ Arquivo existe:"
    cat /var/www/banco-ai/frontend/.env.production
else
    echo "❌ Arquivo NÃO existe!"
fi
echo ""

# 5. Verificar se frontend foi compilado recentemente
echo "5️⃣ Verificando data de compilação do frontend..."
echo "----------------------------------------"
if [ -f /var/www/banco-ai/frontend/dist/index.html ]; then
    echo "✅ Frontend compilado:"
    ls -lh /var/www/banco-ai/frontend/dist/index.html
    echo "Data de modificação:"
    stat -c %y /var/www/banco-ai/frontend/dist/index.html
else
    echo "❌ Frontend NÃO foi compilado!"
fi
echo ""

# 6. Verificar configuração do Nginx
echo "6️⃣ Verificando configuração do Nginx..."
echo "----------------------------------------"
if [ -f /etc/nginx/sites-available/banco-ai ]; then
    echo "✅ Arquivo existe"
    echo "Verificando proxy_pass:"
    grep -A 2 "location /api" /etc/nginx/sites-available/banco-ai | head -5
else
    echo "❌ Arquivo de configuração NÃO existe!"
fi
echo ""

# 7. Verificar logs recentes do backend
echo "7️⃣ Últimas 20 linhas dos logs do backend..."
echo "----------------------------------------"
sudo journalctl -u banco-ai -n 20 --no-pager
echo ""

# 8. Verificar se usuário admin existe no banco
echo "8️⃣ Verificando usuário admin no banco de dados..."
echo "----------------------------------------"
echo "Execute manualmente:"
echo "psql -h 5.161.206.196 -p 5434 -U postgres -d banco_ai -c \"SELECT email, ativo FROM usuarios WHERE email = 'admin@bancoai.com';\""
echo ""

echo "=========================================="
echo "✅ Diagnóstico completo!"
echo "=========================================="

