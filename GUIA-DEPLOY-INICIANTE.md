# 🚀 Guia de Deploy para Iniciantes - BANCO AI

## 📝 O que você precisa ANTES de começar:

1. **Servidor Linux** (Ubuntu/Debian) com acesso SSH
2. **IP ou domínio do servidor** (exemplo: `192.168.1.100` ou `meuservidor.com`)
3. **Usuário e senha** para acessar o servidor via SSH
4. **Acesso root ou sudo** no servidor

---

## 🔑 Passo 0: Entender o que é SSH

SSH é uma forma segura de conectar ao servidor remotamente. É como abrir um terminal no servidor do seu computador.

### Como conectar ao servidor:

**No Windows:**
- Use o **PuTTY** (baixe em: https://www.putty.org/)
- Ou use o **PowerShell** ou **Terminal do Windows 11**
- Ou use o **Git Bash** (se tiver Git instalado)

**No Linux/Mac:**
- Use o Terminal nativo

### Comando SSH básico:
```bash
ssh usuario@IP_DO_SERVIDOR
```

**O que substituir:**
- `usuario` → seu usuário no servidor (exemplo: `root`, `ubuntu`, `admin`, `seu-nome`)
- `IP_DO_SERVIDOR` → o IP ou domínio do seu servidor

**Exemplos reais:**
```bash
# Se seu servidor tem IP 192.168.1.100 e usuário é "ubuntu"
ssh ubuntu@192.168.1.100

# Se seu servidor tem domínio "meuservidor.com" e usuário é "root"
ssh root@meuservidor.com

# Se seu servidor é da DigitalOcean/AWS e usuário é "admin"
ssh admin@45.67.89.123
```

**Primeira vez conectando:**
- O sistema vai perguntar se você confia no servidor → digite `yes`
- Depois vai pedir a senha → digite a senha do usuário

---

## 📋 Passo 1: Conectar ao Servidor

### 1.1. Abra o terminal/PowerShell/PuTTY

### 1.2. Conecte ao servidor:
```bash
ssh SEU_USUARIO@SEU_IP_OU_DOMINIO
```

**Exemplo prático:**
```bash
ssh root@192.168.1.100
```

### 1.3. Digite a senha quando solicitado

### 1.4. Se conectou com sucesso, você verá algo como:
```
usuario@servidor:~$
```

**Parabéns! Você está dentro do servidor! 🎉**

---

## 🔧 Passo 2: Verificar o que já está instalado

Antes de instalar, vamos ver o que já tem:

```bash
# Verificar Java
java -version

# Verificar Maven
mvn -version

# Verificar Node.js
node -v
npm -v

# Verificar Apache
apache2 -v
```

**Se algum comando der erro "comando não encontrado", você precisa instalar.**

---

## 📦 Passo 3: Instalar Dependências (se necessário)

### 3.1. Atualizar o sistema:
```bash
sudo apt update
```

### 3.2. Instalar Java 17:
```bash
sudo apt install openjdk-17-jdk -y
```

### 3.3. Instalar Maven:
```bash
sudo apt install maven -y
```

### 3.4. Instalar Node.js 18:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3.5. Instalar Apache (se não tiver):
```bash
sudo apt install apache2 -y
```

### 3.6. Verificar instalações:
```bash
java -version
mvn -version
node -v
npm -v
apache2 -v
```

---

## 📥 Passo 4: Baixar o Código (Clonar Repositório)

### 4.1. Criar diretório para a aplicação:
```bash
sudo mkdir -p /var/www/banco-ai
```

### 4.2. Dar permissão ao seu usuário:
```bash
sudo chown -R $USER:$USER /var/www/banco-ai
```

### 4.3. Entrar no diretório:
```bash
cd /var/www/banco-ai
```

### 4.4. Clonar o repositório do GitHub:
```bash
git clone https://github.com/quickAIautomation/BANCO_AI.git .
```

**O ponto (.) no final significa "clonar neste diretório"**

### 4.5. Verificar se os arquivos foram baixados:
```bash
ls -la
```

**Você deve ver pastas como: `backend`, `frontend`, arquivos `.md`, etc.**

---

## 🔨 Passo 5: Compilar o Backend

### 5.1. Entrar na pasta do backend:
```bash
cd /var/www/banco-ai/backend
```

### 5.2. Compilar o projeto:
```bash
mvn clean package -DskipTests
```

**Isso pode levar alguns minutos na primeira vez (baixa dependências)**

### 5.3. Verificar se compilou:
```bash
ls -la target/
```

**Você deve ver um arquivo: `banco-ai-1.0.0.jar`**

---

## 🎨 Passo 6: Compilar o Frontend

### 6.1. Voltar para a raiz e entrar no frontend:
```bash
cd /var/www/banco-ai/frontend
```

### 6.2. Instalar dependências do Node:
```bash
npm install
```

**Isso também pode levar alguns minutos**

### 6.3. Compilar o frontend:
```bash
npm run build
```

### 6.4. Verificar se compilou:
```bash
ls -la dist/
```

**Você deve ver arquivos HTML, CSS, JS compilados**

---

## ⚙️ Passo 7: Configurar o Serviço do Backend (Systemd)

### 7.1. Copiar o arquivo de serviço:
```bash
sudo cp /var/www/banco-ai/banco-ai.service /etc/systemd/system/
```

### 7.2. Editar o arquivo para adicionar suas credenciais:
```bash
sudo nano /etc/systemd/system/banco-ai.service
```

### 7.3. No arquivo, você precisa substituir:

**Encontre estas linhas:**
```
Environment="DATABASE_URL=jdbc:postgresql://${DATABASE_HOST}:${DATABASE_PORT}/banco_ai"
Environment="DATABASE_USER=${DATABASE_USER}"
Environment="DATABASE_PASSWORD=${DATABASE_PASSWORD}"
```

**Substitua por (com suas credenciais reais):**
```
Environment="DATABASE_URL=jdbc:postgresql://5.161.206.196:5434/banco_ai"
Environment="DATABASE_USER=postgres"
Environment="DATABASE_PASSWORD=#QuickAI12345"
```

**Também ajuste:**
```
Environment="FRONTEND_URL=https://seu-dominio.com"
```
**Substitua `seu-dominio.com` pelo seu domínio real ou IP do servidor**

### 7.4. Salvar o arquivo:
- Pressione `Ctrl + O` (salvar)
- Pressione `Enter` (confirmar)
- Pressione `Ctrl + X` (sair)

### 7.5. Recarregar e iniciar o serviço:
```bash
sudo systemctl daemon-reload
sudo systemctl enable banco-ai
sudo systemctl start banco-ai
```

### 7.6. Verificar se está rodando:
```bash
sudo systemctl status banco-ai
```

**Se estiver verde e dizendo "active (running)", está funcionando! ✅**

### 7.7. Ver logs (se houver erro):
```bash
sudo journalctl -u banco-ai -f
```

**Pressione `Ctrl + C` para sair dos logs**

---

## 🌐 Passo 8: Configurar o Apache

### 8.1. Habilitar módulos necessários:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
```

### 8.2. Criar arquivo de configuração:
```bash
sudo nano /etc/apache2/sites-available/banco-ai.conf
```

### 8.3. Cole este conteúdo (substitua `seu-dominio.com` pelo seu domínio ou IP):

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

**IMPORTANTE:** Substitua `seu-dominio.com` pelo seu domínio real ou IP do servidor!

**Exemplo se seu servidor tem IP 192.168.1.100:**
```apache
ServerName 192.168.1.100
```

### 8.4. Salvar o arquivo:
- `Ctrl + O`, `Enter`, `Ctrl + X`

### 8.5. Ativar o site:
```bash
sudo a2ensite banco-ai.conf
```

### 8.6. Desabilitar site padrão (opcional):
```bash
sudo a2dissite 000-default.conf
```

### 8.7. Testar configuração:
```bash
sudo apache2ctl configtest
```

**Deve aparecer "Syntax OK"**

### 8.8. Reiniciar Apache:
```bash
sudo systemctl restart apache2
```

---

## 📁 Passo 9: Criar Diretório de Uploads

```bash
sudo mkdir -p /var/www/banco-ai/backend/uploads/carros
sudo chown -R www-data:www-data /var/www/banco-ai/backend/uploads
sudo chmod -R 775 /var/www/banco-ai/backend/uploads
```

---

## ✅ Passo 10: Verificar se Tudo Está Funcionando

### 10.1. Verificar backend:
```bash
sudo systemctl status banco-ai
```

### 10.2. Verificar Apache:
```bash
sudo systemctl status apache2
```

### 10.3. Testar no navegador:
Abra seu navegador e acesse:
- `http://SEU_IP_DO_SERVIDOR` ou
- `http://seu-dominio.com`

**Você deve ver a tela de login da aplicação! 🎉**

---

## 🆘 Problemas Comuns

### Backend não inicia:
```bash
# Ver logs
sudo journalctl -u banco-ai -n 50

# Verificar se porta 8080 está livre
sudo netstat -tlnp | grep 8080
```

### Apache não funciona:
```bash
# Ver logs de erro
sudo tail -f /var/log/apache2/error.log

# Verificar configuração
sudo apache2ctl configtest
```

### Não consegue conectar ao PostgreSQL:
- Verifique se o IP `5.161.206.196` está acessível do servidor
- Teste: `ping 5.161.206.196`
- Verifique se a porta `5434` está aberta

---

## 📝 Resumo dos Comandos Principais

```bash
# 1. Conectar ao servidor
ssh usuario@IP_DO_SERVIDOR

# 2. Instalar dependências
sudo apt update
sudo apt install openjdk-17-jdk maven nodejs apache2 -y

# 3. Clonar repositório
cd /var/www
sudo mkdir -p banco-ai
sudo chown -R $USER:$USER banco-ai
cd banco-ai
git clone https://github.com/quickAIautomation/BANCO_AI.git .

# 4. Compilar backend
cd backend
mvn clean package -DskipTests
cd ..

# 5. Compilar frontend
cd frontend
npm install
npm run build
cd ..

# 6. Configurar serviço
sudo cp banco-ai.service /etc/systemd/system/
sudo nano /etc/systemd/system/banco-ai.service  # Editar credenciais
sudo systemctl daemon-reload
sudo systemctl enable banco-ai
sudo systemctl start banco-ai

# 7. Configurar Apache
sudo nano /etc/apache2/sites-available/banco-ai.conf  # Criar configuração
sudo a2enmod proxy proxy_http rewrite headers
sudo a2ensite banco-ai.conf
sudo systemctl restart apache2
```

---

## 🎯 Próximos Passos

Depois que tudo estiver funcionando:
1. Configure SSL/HTTPS (Let's Encrypt)
2. Configure firewall
3. Configure backups

**Boa sorte com o deploy! 🚀**

