# 🚀 Guia Rápido de Deploy

## Build Rápido

### Windows (PowerShell)
```powershell
.\build-production.ps1
```

### Linux/Mac
```bash
chmod +x build-production.sh
./build-production.sh
```

## Configuração Rápida

### 1. Frontend - Configurar URL da API

Crie o arquivo `frontend/.env.production`:
```
VITE_API_BASE_URL=https://seu-dominio.com/api
```

### 2. Backend - Variáveis de Ambiente

Configure no servidor:
```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/banco_ai
export DATABASE_USER=postgres
export DATABASE_PASSWORD=sua_senha
export JWT_SECRET=sua_chave_secreta_forte
export FRONTEND_URL=https://seu-dominio.com
```

### 3. Executar

**Backend:**
```bash
java -jar -Dspring.profiles.active=prod banco-ai-1.0.0.jar
```

**Frontend:**
- Copie os arquivos de `frontend/dist/` para o servidor web (Nginx, Apache, etc.)

## 📖 Para instruções completas, consulte DEPLOY.md

