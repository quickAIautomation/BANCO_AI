# 🚀 Guia de Deploy no Servidor

## 📋 Pré-requisitos no Servidor

- Java 17 ou superior
- Maven
- Node.js 18+ e npm (para build do frontend)
- Apache instalado e configurado
- Acesso SSH ao servidor

## 🔧 Passo 1: Clonar o Repositório no Servidor

```bash
# Conectar ao servidor
ssh usuario@seu-servidor.com

# Criar diretório da aplicação
sudo mkdir -p /var/www/banco-ai
sudo chown -R $USER:$USER /var/www/banco-ai

# Clonar repositório
cd /var/www/banco-ai
git clone https://github.com/quickAIautomation/BANCO_AI.git .

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/banco-ai
sudo chmod -R 755 /var/www/banco-ai
```

## 🔧 Passo 2: Instalar Dependências

```bash
# Instalar Java 17
sudo apt update
sudo apt install openjdk-17-jdk -y

# Instalar Maven
sudo apt install maven -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

## 🔧 Passo 3: Compilar o Projeto

```bash
cd /var/www/banco-ai

# Compilar backend
cd backend
mvn clean package -DskipTests
cd ..

# Compilar frontend
cd frontend
npm install
npm run build
cd ..
```

## 🔧 Passo 4: Configurar Serviço Systemd

```bash
# Copiar arquivo de serviço
sudo cp /var/www/banco-ai/banco-ai.service /etc/systemd/system/

# IMPORTANTE: Editar o arquivo e ajustar as variáveis de ambiente
sudo nano /etc/systemd/system/banco-ai.service

# IMPORTANTE: Configure as credenciais do PostgreSQL no arquivo:
# Edite /etc/systemd/system/banco-ai.service e configure:
# - DATABASE_HOST (host do PostgreSQL)
# - DATABASE_PORT (porta do PostgreSQL)
# - DATABASE_USER (usuário do PostgreSQL)
# - DATABASE_PASSWORD (senha do PostgreSQL)

# Recarregar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable banco-ai
sudo systemctl start banco-ai
sudo systemctl status banco-ai
```

## 🔧 Passo 5: Configurar Apache

```bash
# Criar arquivo de configuração
sudo nano /etc/apache2/sites-available/banco-ai.conf
```

Cole o seguinte conteúdo (ajuste o domínio):

```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    ServerAlias www.seu-dominio.com
    
    # Frontend - Servir arquivos estáticos
    DocumentRoot /var/www/banco-ai/frontend/dist
    
    <Directory /var/www/banco-ai/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA - Redirecionar todas as rotas para index.html
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Backend API - Proxy reverso
    ProxyPreserveHost On
    ProxyRequests Off
    
    <Location /api>
        ProxyPass http://localhost:8080/api
        ProxyPassReverse http://localhost:8080/api
        ProxyPassReverse /api http://localhost:8080/api
    </Location>
    
    # Uploads de fotos
    <Location /api/carros/fotos>
        ProxyPass http://localhost:8080/api/carros/fotos
        ProxyPassReverse http://localhost:8080/api/carros/fotos
    </Location>
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/banco-ai_error.log
    CustomLog ${APACHE_LOG_DIR}/banco-ai_access.log combined
</VirtualHost>
```

Habilitar módulos e ativar site:

```bash
# Habilitar módulos necessários
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers

# Ativar o site
sudo a2ensite banco-ai.conf

# Desabilitar site padrão (opcional)
sudo a2dissite 000-default.conf

# Testar configuração
sudo apache2ctl configtest

# Reiniciar Apache
sudo systemctl restart apache2
```

## 🔧 Passo 6: Criar Diretório de Uploads

```bash
sudo mkdir -p /var/www/banco-ai/backend/uploads/carros
sudo chown -R www-data:www-data /var/www/banco-ai/backend/uploads
sudo chmod -R 775 /var/www/banco-ai/backend/uploads
```

## 🔧 Passo 7: Configurar SSL (Opcional mas Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-apache -y

# Obter certificado SSL
sudo certbot --apache -d seu-dominio.com -d www.seu-dominio.com
```

## ✅ Verificação

```bash
# Verificar status do backend
sudo systemctl status banco-ai

# Ver logs do backend
sudo journalctl -u banco-ai -f

# Verificar se está rodando na porta 8080
sudo netstat -tlnp | grep 8080

# Testar API
curl http://localhost:8080/api/auth/login
```

## 🔄 Atualizações Futuras

Para atualizar a aplicação no servidor:

```bash
cd /var/www/banco-ai

# Atualizar código
git pull origin master

# Recompilar backend
cd backend
mvn clean package -DskipTests
cd ..

# Recompilar frontend
cd frontend
npm install
npm run build
cd ..

# Reiniciar serviço
sudo systemctl restart banco-ai

# Reiniciar Apache (se necessário)
sudo systemctl restart apache2
```

## 📝 Configuração de Credenciais

⚠️ **IMPORTANTE:** Configure as credenciais do PostgreSQL no arquivo de serviço ou via variáveis de ambiente no servidor.

- **PostgreSQL Host:** Configure via `DATABASE_HOST` no arquivo de serviço
- **PostgreSQL Porta:** Configure via `DATABASE_PORT` no arquivo de serviço
- **PostgreSQL Banco:** banco_ai
- **PostgreSQL Usuário:** Configure via `DATABASE_USER` no arquivo de serviço
- **PostgreSQL Senha:** Configure via `DATABASE_PASSWORD` no arquivo de serviço

## 🆘 Troubleshooting

### Backend não inicia
```bash
# Ver logs
sudo journalctl -u banco-ai -n 50

# Verificar variáveis de ambiente
sudo systemctl show banco-ai | grep Environment
```

### Erro de conexão com PostgreSQL
- Verifique se o host do PostgreSQL está acessível do servidor
- Verifique se a porta está aberta no firewall
- Teste conexão: `telnet SEU_HOST_POSTGRES SEU_PORTA`
- Verifique as credenciais no arquivo `/etc/systemd/system/banco-ai.service`

### Apache não serve o frontend
- Verifique permissões: `ls -la /var/www/banco-ai/frontend/dist`
- Verifique logs: `sudo tail -f /var/log/apache2/error.log`
- Verifique configuração: `sudo apache2ctl configtest`

