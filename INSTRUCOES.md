# 🚀 Instruções Rápidas - BANCO AI

## ⚡ Início Rápido

### 1. Configurar Banco de Dados PostgreSQL

Crie um banco de dados PostgreSQL chamado `banco_ai`:

```sql
CREATE DATABASE banco_ai;
```

Ou altere as configurações em `backend/src/main/resources/application.properties` se preferir usar outro banco.

### 2. Iniciar o Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

O backend estará disponível em: `http://localhost:8080`

**Credenciais padrão:**
- Email: `admin@bancoai.com`
- Senha: `admin123`

### 3. Iniciar o Frontend

Em um novo terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

## 📝 Funcionalidades

✅ Login de administrador
✅ Cadastro de carros (placa, quilometragem, modelo, marca, fotos, observações)
✅ Visualização em cards
✅ Edição de carros
✅ Exclusão de carros
✅ Upload de múltiplas fotos

## 🎨 Design

- Cores: Preto, Vermelho (#DC2626), Branco
- Interface limpa e moderna
- Responsiva

## 🔧 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais em `application.properties`

### Erro ao fazer upload de fotos
- Certifique-se de que a pasta `backend/uploads/carros` existe
- Verifique permissões de escrita

### Porta já em uso
- Backend: Altere `server.port` em `application.properties`
- Frontend: Altere `port` em `vite.config.js`

## 📚 Documentação Completa

Veja o arquivo `README.md` para documentação completa.

