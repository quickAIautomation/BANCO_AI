# BANCO AI - Sistema de Gerenciamento de Carros

Sistema completo para gerenciamento de banco de dados de carros com interface visual moderna.

## 🚀 Tecnologias

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** (Autenticação JWT)
- **Spring Data JPA**
- **PostgreSQL** (Banco de dados)
- **Maven** (Gerenciamento de dependências)

### Frontend
- **React 18**
- **Vite** (Build tool)
- **Tailwind CSS** (Estilização)
- **Axios** (Requisições HTTP)
- **React Router** (Roteamento)
- **React Icons** (Ícones)

## 📋 Funcionalidades

- ✅ Autenticação de administrador com JWT
- ✅ Cadastro de carros com:
  - Placa (única)
  - Quilometragem
  - Modelo
  - Marca
  - Fotos do veículo (múltiplas)
  - Observações
- ✅ Painel visual com todos os carros cadastrados
- ✅ Edição de carros
- ✅ Exclusão de carros
- ✅ Interface moderna com cores: Preto, Vermelho e Branco

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Java 17 ou superior
- Maven 3.6+
- PostgreSQL 12+
- Node.js 18+ e npm
- PostgreSQL instalado e rodando

### Backend

1. Configure o banco de dados PostgreSQL:
   - Crie um banco de dados chamado `banco_ai`
   - Ou altere as configurações em `backend/src/main/resources/application.properties`

2. Navegue até a pasta do backend:
```bash
cd backend
```

3. Compile e execute o projeto:
```bash
mvn clean install
mvn spring-boot:run
```

O backend estará rodando em `http://localhost:8080`

**Credenciais padrão do administrador:**
- Email: `admin@bancoai.com`
- Senha: `admin123`

### Frontend

1. Navegue até a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
BANCO_AI/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/bancoai/
│   │   │   │   ├── config/          
│   │   │   │   ├── controller/      
│   │   │   │   ├── dto/             
│   │   │   │   ├── model/            
│   │   │   │   ├── repository/       
│   │   │   │   ├── security/        
│   │   │   │   └── service/          
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/               # Componentes React
│   │   ├── pages/                    # Páginas
│   │   ├── services/                 # Serviços API
│   │   ├── utils/                    # Utilitários
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🎨 Paleta de Cores

- **Preto (#000000)**: Fundo principal
- **Vermelho (#DC2626)**: Destaques e ações principais
- **Branco (#FFFFFF)**: Textos e cards

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login do administrador

### Carros
- `GET /api/carros` - Listar todos os carros
- `GET /api/carros/{id}` - Buscar carro por ID
- `POST /api/carros` - Criar novo carro
- `PUT /api/carros/{id}` - Atualizar carro
- `DELETE /api/carros/{id}` - Deletar carro
- `GET /api/carros/fotos/{nomeArquivo}` - Obter foto do carro

## 🔒 Segurança

- Autenticação JWT
- Senhas criptografadas com BCrypt
- CORS configurado
- Rotas protegidas

## 📸 Funcionalidades de Upload

As fotos dos carros são armazenadas localmente na pasta `backend/uploads/carros/`. O sistema suporta múltiplas fotos por carro.

## 🚧 Desenvolvimento

Para desenvolvimento, você pode usar o H2 Database alterando o `application.properties`:

```properties
spring.datasource.url=jdbc:h2:mem:banco_ai
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

## 📄 Licença

Este projeto é de uso interno.

