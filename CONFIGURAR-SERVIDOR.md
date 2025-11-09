# Configuração do Servidor - BANCO AI

## Credenciais do PostgreSQL Configuradas

- **Host:** 5.161.206.196
- **Porta:** 5434
- **Banco de Dados:** banco_ai
- **Usuário:** postgres
- **Senha:** #QuickAI12345

## Comandos para Configurar no Servidor

### 1. Copiar arquivo de serviço para o servidor

```bash
# No servidor, criar o arquivo de serviço
sudo nano /etc/systemd/system/banco-ai.service
```

Cole o conteúdo do arquivo `banco-ai.service` que foi criado.

### 2. Recarregar e ativar o serviço

```bash
# Recarregar configurações do systemd
sudo systemctl daemon-reload

# Habilitar serviço para iniciar automaticamente
sudo systemctl enable banco-ai

# Iniciar o serviço
sudo systemctl start banco-ai

# Verificar status
sudo systemctl status banco-ai

# Ver logs em tempo real
sudo journalctl -u banco-ai -f
```

### 3. Verificar conexão com PostgreSQL

O backend tentará conectar automaticamente ao PostgreSQL quando iniciar. Verifique os logs:

```bash
sudo journalctl -u banco-ai -f
```

Se houver erros de conexão, verifique:
- Se o IP 5.161.206.196 está acessível do servidor
- Se a porta 5434 está aberta no firewall do servidor PostgreSQL
- Se as credenciais estão corretas

### 4. Testar conexão manualmente (opcional)

```bash
# Instalar cliente PostgreSQL (se não tiver)
sudo apt install postgresql-client -y

# Testar conexão
psql -h 5.161.206.196 -p 5434 -U postgres -d banco_ai
# Digite a senha quando solicitado: #QuickAI12345
```

## Configuração do Apache

### Criar arquivo de configuração do Apache

```bash
sudo nano /etc/apache2/sites-available/banco-ai.conf
```

Cole a configuração do Apache (já mencionada anteriormente).

### Habilitar módulos e site

```bash
sudo a2enmod proxy proxy_http rewrite headers
sudo a2ensite banco-ai.conf
sudo apache2ctl configtest
sudo systemctl restart apache2
```

## Variáveis de Ambiente Configuradas

As seguintes variáveis estão configuradas no serviço:

- `DATABASE_URL=jdbc:postgresql://5.161.206.196:5434/banco_ai`
- `DATABASE_USER=postgres`
- `DATABASE_PASSWORD=#QuickAI12345`
- `JWT_SECRET=bancoAiSecretKey2024SuperSecureKeyForJWTTokenGenerationChangeThisInProduction` ⚠️ **Altere em produção!**
- `FRONTEND_URL=https://seu-dominio.com` ⚠️ **Ajuste com seu domínio!**
- `UPLOAD_DIR=/var/www/banco-ai/backend/uploads/carros`

## Importante

⚠️ **Lembre-se de alterar:**
1. `JWT_SECRET` para uma chave secreta forte e única
2. `FRONTEND_URL` para o domínio real do seu servidor
3. Configurar credenciais de email se necessário

## Troubleshooting

### Backend não conecta ao PostgreSQL

```bash
# Verificar se o IP está acessível
ping 5.161.206.196

# Verificar se a porta está aberta
telnet 5.161.206.196 5434
# OU
nc -zv 5.161.206.196 5434

# Ver logs do backend
sudo journalctl -u banco-ai -n 50
```

### Verificar se o serviço está rodando

```bash
sudo systemctl status banco-ai
sudo netstat -tlnp | grep 8080
```

