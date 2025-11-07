# Guia de Deploy - BANCO AI

Este guia explica como publicar a aplicação BANCO AI no servidor.

## 📋 Pré-requisitos

- Java 17 ou superior
- Maven
- Node.js 18+ e npm
- PostgreSQL (para produção)
- Servidor com acesso SSH (ou similar)

## 🚀 Passo a Passo

### 1. Preparar o Backend

#### 1.1. Configurar Variáveis de Ambiente

No servidor, configure as seguintes variáveis de ambiente:

```bash
# Database
export DATABASE_URL=jdbc:postgresql://localhost:5432/banco_ai
export DATABASE_USER=postgres
export DATABASE_PASSWORD=sua_senha_aqui

# JWT Secret (use uma chave forte!)
export JWT_SECRET=sua_chave_secreta_super_forte_aqui

# Frontend URL
export FRONTEND_URL=https://seu-dominio.com

# Email (opcional)
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587
export MAIL_USERNAME=seu_email@gmail.com
export MAIL_PASSWORD=sua_senha_app

# Upload Directory
export UPLOAD_DIR=/var/www/banco-ai/uploads/carros
```

#### 1.2. Compilar o Backend

```bash
cd backend
mvn clean package -DskipTests
```

O arquivo JAR será gerado em: `backend/target/banco-ai-1.0.0.jar`

#### 1.3. Executar o Backend

```bash
java -jar -Dspring.profiles.active=prod target/banco-ai-1.0.0.jar
```

Ou usando systemd (criar arquivo `/etc/systemd/system/banco-ai.service`):

```ini
[Unit]
Description=BANCO AI Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/banco-ai/backend
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /var/www/banco-ai/backend/target/banco-ai-1.0.0.jar
Restart=always
RestartSec=10
Environment="DATABASE_URL=jdbc:postgresql://localhost:5432/banco_ai"
Environment="DATABASE_USER=postgres"
Environment="DATABASE_PASSWORD=sua_senha"
Environment="JWT_SECRET=sua_chave_secreta"
Environment="FRONTEND_URL=https://seu-dominio.com"

[Install]
WantedBy=multi-user.target
```

Ativar o serviço:
```bash
sudo systemctl enable banco-ai
sudo systemctl start banco-ai
sudo systemctl status banco-ai
```

### 2. Preparar o Frontend

#### 2.1. Atualizar URL da API

Edite `frontend/src/services/api.js` e altere a `baseURL` para o endereço do seu servidor:

```javascript
const api = axios.create({
  baseURL: 'https://seu-dominio.com/api',  // Altere aqui
  headers: {
    'Content-Type': 'application/json'
  }
})
```

#### 2.2. Build do Frontend

```bash
cd frontend
npm install
npm run build
```

Os arquivos estáticos serão gerados em: `frontend/dist/`

#### 2.3. Servir o Frontend

**Opção 1: Nginx (Recomendado)**

Criar arquivo `/etc/nginx/sites-available/banco-ai`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        root /var/www/banco-ai/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /api/carros/fotos {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Ativar o site:
```bash
sudo ln -s /etc/nginx/sites-available/banco-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Opção 2: Servir com Node.js**

```bash
cd frontend
npm install -g serve
serve -s dist -l 3000
```

### 3. Configurar Banco de Dados PostgreSQL

```bash
# Criar banco de dados
sudo -u postgres psql
CREATE DATABASE banco_ai;
CREATE USER banco_ai_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE banco_ai TO banco_ai_user;
\q
```

### 4. Estrutura de Diretórios no Servidor

```
/var/www/banco-ai/
├── backend/
│   ├── target/
│   │   └── banco-ai-1.0.0.jar
│   └── uploads/
│       └── carros/
└── frontend/
    └── dist/
```

### 5. Configurar SSL (HTTPS) - Recomendado

Use Let's Encrypt com Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### 6. Firewall

```bash
# Permitir portas necessárias
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp  # Apenas se necessário
sudo ufw enable
```

## 🔧 Troubleshooting

### Backend não inicia
- Verifique os logs: `sudo journalctl -u banco-ai -f`
- Verifique se o PostgreSQL está rodando
- Verifique as variáveis de ambiente

### Frontend não carrega
- Verifique se o build foi feito corretamente
- Verifique as permissões dos arquivos
- Verifique os logs do Nginx: `sudo tail -f /var/log/nginx/error.log`

### Erro de CORS
- Verifique se `FRONTEND_URL` está configurado corretamente
- Verifique se o Nginx está redirecionando corretamente

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] PostgreSQL instalado e configurado
- [ ] Backend compilado e testado
- [ ] Frontend buildado
- [ ] Nginx configurado
- [ ] SSL configurado (HTTPS)
- [ ] Firewall configurado
- [ ] Serviços iniciados e funcionando
- [ ] Testes de acesso realizados

## 🔐 Segurança

- [ ] JWT_SECRET alterado para uma chave forte
- [ ] Senhas do banco de dados seguras
- [ ] HTTPS configurado
- [ ] Firewall ativado
- [ ] Backups do banco de dados configurados

## 📞 Suporte

Em caso de problemas, verifique:
1. Logs do backend: `sudo journalctl -u banco-ai -f`
2. Logs do Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Logs do PostgreSQL: `/var/log/postgresql/`

