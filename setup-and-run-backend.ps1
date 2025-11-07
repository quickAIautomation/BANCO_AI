# Script para instalar Java, configurar Maven e rodar o backend
# Execute como Administrador: Set-ExecutionPolicy Bypass -Scope Process; .\setup-and-run-backend.ps1

Write-Host "=== Configurando ambiente e iniciando backend ===" -ForegroundColor Cyan

# 1. Verificar/Instalar Java
Write-Host "`n[1/3] Verificando Java..." -ForegroundColor Yellow
$javaInstalled = $false
$javaHome = $null

# Verificar se Java já está no PATH
try {
    $javaVersion = java -version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $javaInstalled = $true
        Write-Host "Java encontrado no PATH!" -ForegroundColor Green
    }
} catch {
    # Java não está no PATH, procurar em locais comuns
    $javaPaths = @(
        "C:\Program Files\Java",
        "C:\Program Files (x86)\Java",
        "$env:ProgramFiles\Eclipse Adoptium",
        "$env:ProgramFiles\Microsoft",
        "$env:LOCALAPPDATA\Programs\Eclipse Adoptium"
    )
    
    foreach ($path in $javaPaths) {
        if (Test-Path $path) {
            $jdks = Get-ChildItem $path -Directory -ErrorAction SilentlyContinue | Where-Object { 
                $_.Name -like "*jdk*" -or $_.Name -like "*java*" 
            }
            if ($jdks) {
                $latestJdk = $jdks | Sort-Object Name -Descending | Select-Object -First 1
                $javaHome = $latestJdk.FullName
                $env:JAVA_HOME = $javaHome
                $env:Path += ";$javaHome\bin"
                $javaInstalled = $true
                Write-Host "Java encontrado em: $javaHome" -ForegroundColor Green
                break
            }
        }
    }
}

# Se Java não foi encontrado, instalar via winget
if (-not $javaInstalled) {
    Write-Host "Java não encontrado. Instalando OpenJDK 17..." -ForegroundColor Yellow
    try {
        winget install --id Microsoft.OpenJDK.17 --accept-package-agreements --accept-source-agreements --silent
        Start-Sleep -Seconds 5
        
        # Procurar instalação do Microsoft OpenJDK
        $msJavaPath = "C:\Program Files\Microsoft\jdk-17*"
        if (Test-Path $msJavaPath) {
            $javaHome = (Get-ChildItem $msJavaPath | Sort-Object Name -Descending | Select-Object -First 1).FullName
            $env:JAVA_HOME = $javaHome
            $env:Path += ";$javaHome\bin"
            [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "Machine")
            Write-Host "Java instalado em: $javaHome" -ForegroundColor Green
        }
    } catch {
        Write-Host "Erro ao instalar Java via winget. Por favor, instale o Java manualmente." -ForegroundColor Red
        Write-Host "Baixe em: https://adoptium.net/" -ForegroundColor Yellow
        exit 1
    }
}

# Configurar JAVA_HOME permanentemente se ainda não estiver configurado
if ($javaHome -and -not [Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")) {
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "Machine")
    Write-Host "JAVA_HOME configurado permanentemente" -ForegroundColor Green
}

# 2. Configurar Maven
Write-Host "`n[2/3] Configurando Maven..." -ForegroundColor Yellow
$mavenPath = "C:\Program Files\Apache\maven\bin"
if (Test-Path $mavenPath) {
    $env:Path += ";$mavenPath"
    Write-Host "Maven encontrado!" -ForegroundColor Green
} else {
    Write-Host "Maven não encontrado em $mavenPath" -ForegroundColor Red
    exit 1
}

# Verificar se Maven funciona
try {
    $mvnVersion = mvn --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Maven configurado corretamente!" -ForegroundColor Green
    } else {
        Write-Host "Erro ao executar Maven. Verifique JAVA_HOME." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Erro ao executar Maven: $_" -ForegroundColor Red
    exit 1
}

# 3. Rodar o backend
Write-Host "`n[3/3] Iniciando backend Spring Boot..." -ForegroundColor Yellow
Write-Host "Backend será iniciado na porta 8080" -ForegroundColor Cyan
Write-Host "Aguarde a compilação (pode levar alguns minutos na primeira vez)..." -ForegroundColor Cyan
Write-Host "`nPressione Ctrl+C para parar o servidor`n" -ForegroundColor Yellow

# Navegar para o diretório do backend e executar
Set-Location backend
mvn spring-boot:run

