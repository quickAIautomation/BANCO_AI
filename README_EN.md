# BANCO AI - Vehicle Management System

A complete full-stack application for managing a vehicle database with a modern web interface. This system allows administrators to register, view, edit, and delete vehicles with detailed information including photos, mileage, and observations.

## 🚀 Technologies

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Application framework
- **Spring Security** - Authentication and authorization (JWT)
- **Spring Data JPA** - Data persistence layer
- **PostgreSQL / H2** - Database (PostgreSQL for production, H2 for development)
- **Maven** - Dependency management
- **JWT (JSON Web Tokens)** - Stateless authentication
- **BCrypt** - Password encryption

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing
- **React Icons** - Icon library

## 📋 Features

### Authentication & Security
- ✅ JWT-based administrator authentication
- ✅ Secure password encryption with BCrypt
- ✅ Protected routes and API endpoints
- ✅ CORS configuration for cross-origin requests
- ✅ Session management (stateless)

### Vehicle Management
- ✅ **Create vehicles** with complete information:
  - License plate (unique identifier)
  - Mileage (kilometers)
  - Model
  - Brand/Manufacturer
  - Multiple photos per vehicle
  - Observations/Notes
- ✅ **View all vehicles** in a modern card-based dashboard
- ✅ **Edit vehicle** information and photos
- ✅ **Delete vehicles** with confirmation
- ✅ **Photo management** - Upload, view, and delete multiple photos per vehicle
- ✅ **Automatic timestamps** - Registration and update dates

### Profile Management
- ✅ **View administrator profile** - Display name and email
- ✅ **Update email** - Change administrator email with password verification
- ✅ **Update password** - Change password with current password verification
- ✅ **Secure profile updates** - All changes require current password confirmation

### Public API
- ✅ **Public REST API** - Access vehicle data without authentication
- ✅ **Integration ready** - Designed for use with automation tools (n8n, Zapier, etc.)
- ✅ **Multiple endpoints**:
  - List all vehicles
  - Get vehicle by ID
  - Get vehicle by license plate
- ✅ **Complete data** - Returns all vehicle information including full photo URLs

## 🛠️ Installation & Setup

### Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **PostgreSQL 12+** (optional, H2 can be used for development)
- **Node.js 18+** and npm
- **Git** (for cloning the repository)

### Backend Setup

1. **Configure the database:**

   For PostgreSQL:
   ```sql
   CREATE DATABASE banco_ai;
   ```
   
   Or modify `backend/src/main/resources/application.properties` to use H2 (in-memory database for development):
   ```properties
   spring.datasource.url=jdbc:h2:mem:banco_ai
   spring.datasource.driver-class-name=org.h2.Driver
   ```

2. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

3. **Compile and run:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will be running at `http://localhost:8080`

   **Default administrator credentials:**
   - Email: `admin@bancoai.com`
   - Password: `admin123`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   The frontend will be running at `http://localhost:3000`

## 📁 Project Structure

```
BANCO_AI/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/bancoai/
│   │   │   │   ├── config/              # Configuration classes
│   │   │   │   │   ├── DataInitializer.java    # Initial data setup
│   │   │   │   │   └── SecurityConfig.java    # Security & CORS config
│   │   │   │   ├── controller/          # REST Controllers
│   │   │   │   │   ├── AuthController.java           # Authentication endpoints
│   │   │   │   │   ├── CarroController.java         # Vehicle CRUD (authenticated)
│   │   │   │   │   ├── PublicCarroController.java    # Public API endpoints
│   │   │   │   │   └── UsuarioController.java       # User profile endpoints
│   │   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   │   ├── AuthResponseDTO.java
│   │   │   │   │   ├── CarroDTO.java
│   │   │   │   │   ├── LoginDTO.java
│   │   │   │   │   ├── UpdateEmailDTO.java
│   │   │   │   │   ├── UpdateSenhaDTO.java
│   │   │   │   │   └── UsuarioDTO.java
│   │   │   │   ├── model/               # JPA Entities
│   │   │   │   │   ├── Carro.java
│   │   │   │   │   └── Usuario.java
│   │   │   │   ├── repository/          # JPA Repositories
│   │   │   │   │   ├── CarroRepository.java
│   │   │   │   │   └── UsuarioRepository.java
│   │   │   │   ├── security/            # Security components
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   └── JwtTokenProvider.java
│   │   │   │   └── service/             # Business logic
│   │   │   │       ├── AuthService.java
│   │   │   │       ├── CarroService.java
│   │   │   │       └── UsuarioService.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── uploads/                         # Vehicle photos storage
│   │   └── carros/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/                  # React components
│   │   │   ├── CarroCard.jsx           # Vehicle card component
│   │   │   └── CarroForm.jsx           # Vehicle form component
│   │   ├── pages/                       # Page components
│   │   │   ├── Dashboard.jsx           # Main dashboard
│   │   │   ├── Login.jsx               # Login page
│   │   │   └── Perfil.jsx              # Profile management page
│   │   ├── services/                    # API services
│   │   │   └── api.js                  # Axios configuration
│   │   ├── utils/                       # Utilities
│   │   │   └── auth.js                 # Authentication helpers
│   │   ├── App.jsx                     # Main app component
│   │   └── main.jsx                    # Entry point
│   ├── package.json
│   └── vite.config.js
├── API_PUBLICA.md                      # Public API documentation (Portuguese)
├── README.md                           # Main documentation (Portuguese)
└── README_EN.md                        # English documentation
```

## 🎨 Design & UI

### Color Palette
- **Black (#000000)**: Main background
- **Red (#DC2626)**: Primary actions and highlights
- **White (#FFFFFF)**: Text and cards
- **Gray shades**: Secondary elements

### UI Features
- Modern, clean interface
- Responsive design (mobile-friendly)
- Card-based layout for vehicles
- Intuitive navigation
- Loading states and error handling
- Form validation
- Image preview and error fallbacks

## 📝 API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - Administrator login
  - Request: `{ "email": "string", "senha": "string" }`
  - Response: `{ "token": "string", "email": "string", "nome": "string" }`

### Vehicle Endpoints (Authenticated)
- `GET /api/carros` - List all vehicles
- `GET /api/carros/{id}` - Get vehicle by ID
- `POST /api/carros` - Create new vehicle (multipart/form-data)
- `PUT /api/carros/{id}` - Update vehicle (multipart/form-data)
- `DELETE /api/carros/{id}` - Delete vehicle
- `GET /api/carros/fotos/{nomeArquivo}` - Get vehicle photo

### Profile Endpoints (Authenticated)
- `GET /api/usuarios/perfil` - Get administrator profile
- `PUT /api/usuarios/perfil/email` - Update email
- `PUT /api/usuarios/perfil/senha` - Update password

### Public API Endpoints (No Authentication Required)
- `GET /api/public/carros` - List all vehicles (public)
- `GET /api/public/carros/{id}` - Get vehicle by ID (public)
- `GET /api/public/carros/placa/{placa}` - Get vehicle by license plate (public)

## 🔒 Security Features

- **JWT Authentication**: Stateless token-based authentication
- **Password Encryption**: BCrypt hashing for secure password storage
- **Protected Routes**: Frontend routes require authentication
- **API Security**: Most endpoints require JWT token
- **CORS Configuration**: Configured for secure cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Validated file types and sizes

## 📸 Photo Management

- **Multiple Photos**: Support for multiple photos per vehicle
- **Local Storage**: Photos stored in `backend/uploads/carros/`
- **Automatic Naming**: Files named with license plate and UUID
- **URL Generation**: Automatic absolute URL generation for photos
- **Content Type Detection**: Automatic image type detection (JPEG, PNG, etc.)
- **Error Handling**: Fallback icons when photos fail to load

## 🌐 Public API for Integration

The application includes a public API designed for integration with automation tools like n8n, Zapier, or custom applications.

### Features:
- **No Authentication Required**: Public endpoints accessible without tokens
- **Complete Data**: Returns all vehicle information including full photo URLs
- **Multiple Query Methods**: Search by ID or license plate
- **CORS Enabled**: Accepts requests from any origin
- **RESTful Design**: Standard HTTP methods and status codes

See `API_PUBLICA.md` for detailed documentation (in Portuguese) or use the endpoints:
- `GET /api/public/carros` - List all vehicles
- `GET /api/public/carros/{id}` - Get vehicle by ID
- `GET /api/public/carros/placa/{placa}` - Get vehicle by license plate

## 🚀 Usage

### Starting the Application

1. **Start the backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8080`
   - Public API: `http://localhost:8080/api/public/carros`

### Default Login
- **Email**: `admin@bancoai.com`
- **Password**: `admin123`

## 🔧 Configuration

### Database Configuration

Edit `backend/src/main/resources/application.properties`:

**For PostgreSQL:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/banco_ai
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

**For H2 (Development):**
```properties
spring.datasource.url=jdbc:h2:mem:banco_ai
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
```

### Server Port

Change the backend port in `application.properties`:
```properties
server.port=8080
```

Change the frontend port in `vite.config.js`:
```javascript
server: {
  port: 3000
}
```

## 🧪 Testing

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bancoai.com","senha":"admin123"}'
```

**List vehicles (public):**
```bash
curl http://localhost:8080/api/public/carros
```

**Get vehicle by ID (public):**
```bash
curl http://localhost:8080/api/public/carros/1
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check credentials in `application.properties`
- Ensure database `banco_ai` exists

### Photo Upload Issues
- Verify `backend/uploads/carros/` directory exists
- Check file write permissions
- Verify file size limits (max 10MB per file)

### Port Already in Use
- Backend: Change `server.port` in `application.properties`
- Frontend: Change `port` in `vite.config.js`

### CORS Errors
- Verify CORS configuration in `SecurityConfig.java`
- Check allowed origins match your frontend URL

## 📚 Additional Documentation

- **API_PUBLICA.md**: Public API documentation (Portuguese)
- **README.md**: Main documentation (Portuguese)
- **INSTRUCOES.md**: Quick start guide (Portuguese)

## 🎯 Key Features Summary

✅ **Full CRUD operations** for vehicle management  
✅ **JWT-based authentication** system  
✅ **Profile management** with email and password updates  
✅ **Multiple photo upload** per vehicle  
✅ **Public REST API** for integrations  
✅ **Responsive design** for all devices  
✅ **Secure password handling** with BCrypt  
✅ **Automatic data initialization** on first run  
✅ **Error handling** and user feedback  
✅ **Modern UI/UX** with Tailwind CSS  

## 📄 License

This project is for internal use.

## 👥 Development

Built with modern web technologies following best practices:
- RESTful API design
- Separation of concerns
- Secure authentication
- Responsive design
- Clean code architecture

---

**BANCO AI** - Complete Vehicle Management System

