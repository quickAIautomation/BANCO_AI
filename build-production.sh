#!/bin/bash

# Script para build da aplicação para produção
# Uso: ./build-production.sh

echo "🚀 Iniciando build para produção..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Build do Backend
echo -e "${YELLOW}📦 Compilando backend...${NC}"
cd backend
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao compilar o backend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend compilado com sucesso!${NC}"
echo -e "   Arquivo: backend/target/banco-ai-1.0.0.jar"
cd ..

# 2. Build do Frontend
echo -e "${YELLOW}📦 Compilando frontend...${NC}"
cd frontend

# Verificar se existe .env.production
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env.production não encontrado${NC}"
    echo -e "${YELLOW}   Criando a partir do exemplo...${NC}"
    if [ -f .env.production.example ]; then
        cp .env.production.example .env.production
        echo -e "${YELLOW}   ⚠️  IMPORTANTE: Edite .env.production e configure VITE_API_BASE_URL${NC}"
    fi
fi

npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências do frontend${NC}"
    exit 1
fi

npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao compilar o frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend compilado com sucesso!${NC}"
echo -e "   Arquivos em: frontend/dist/"
cd ..

echo ""
echo -e "${GREEN}🎉 Build concluído com sucesso!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure as variáveis de ambiente no servidor"
echo "   2. Copie backend/target/banco-ai-1.0.0.jar para o servidor"
echo "   3. Copie frontend/dist/ para o servidor"
echo "   4. Configure Nginx (veja DEPLOY.md)"
echo "   5. Inicie o backend: java -jar -Dspring.profiles.active=prod banco-ai-1.0.0.jar"
echo ""
echo "📖 Consulte DEPLOY.md para instruções detalhadas"

