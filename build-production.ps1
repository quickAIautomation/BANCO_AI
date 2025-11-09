# Script PowerShell para build da aplicação para produção
# Uso: .\build-production.ps1

Write-Host "🚀 Iniciando build para produção..." -ForegroundColor Cyan

# 1. Build do Backend
Write-Host "`n📦 Compilando backend..." -ForegroundColor Yellow
Set-Location backend
mvn clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao compilar o backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend compilado com sucesso!" -ForegroundColor Green
Write-Host "   Arquivo: backend\target\banco-ai-1.0.0.jar" -ForegroundColor Gray
Set-Location ..

# 2. Build do Frontend
Write-Host "`n📦 Compilando frontend..." -ForegroundColor Yellow
Set-Location frontend

# Verificar se existe .env.production
if (!(Test-Path .env.production)) {
    Write-Host "⚠️  Arquivo .env.production não encontrado" -ForegroundColor Yellow
    Write-Host "   Criando a partir do exemplo..." -ForegroundColor Yellow
    if (Test-Path .env.production.example) {
        Copy-Item .env.production.example .env.production
        Write-Host "   ⚠️  IMPORTANTE: Edite .env.production e configure VITE_API_BASE_URL" -ForegroundColor Yellow
    }
}

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao compilar o frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend compilado com sucesso!" -ForegroundColor Green
Write-Host "   Arquivos em: frontend\dist\" -ForegroundColor Gray
Set-Location ..

Write-Host ""
Write-Host "🎉 Build concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Configure as variáveis de ambiente no servidor"
Write-Host "   2. Copie backend\target\banco-ai-1.0.0.jar para o servidor"
Write-Host "   3. Copie frontend\dist\ para o servidor"
Write-Host "   4. Configure Nginx (veja DEPLOY.md)"
Write-Host "   5. Inicie o backend: java -jar -Dspring.profiles.active=prod banco-ai-1.0.0.jar"
Write-Host ""
Write-Host "📖 Consulte DEPLOY.md para instruções detalhadas" -ForegroundColor Yellow

