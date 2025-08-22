# Buddy AI - Smart AI Assistant

Buddy is an intelligent AI assistant built with Spring Boot, featuring a modular architecture with streaming chat capabilities, tool integration, and persistent memory.

## 🏗️ Architecture

The project is structured as a Gradle multi-module build:

```
buddy/
├─ build.gradle (root, dependency management)
├─ settings.gradle
├─ agent-service/   (LLM orchestrator + streaming SSE API)
├─ memory-service/  (chat history, Postgres storage)
├─ tools-service/   (pluggable tools: Notes + Web Search)
├─ common/          (DTOs, interfaces, shared utils)
└─ ui/              (optional React frontend later)
```

## 🚀 Quick Start

### Prerequisites

- Java 21+
- Gradle 8.0+
- Docker & Docker Compose
- OpenAI API Key

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### 2. Start PostgreSQL

```bash
docker-compose up -d postgres
```

Wait for the database to be ready (check with `docker-compose ps`).

### 3. Build and Run

```bash
# Build all modules
./gradlew build

# Run services (in separate terminals)
./gradlew :agent-service:bootRun
./gradlew :memory-service:bootRun
./gradlew :tools-service:bootRun
```

### 4. Test the API

```bash
# Test chat streaming
curl -X POST http://localhost:8080/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Buddy!", "sessionId": "test-session-1"}'

# Test tools
curl http://localhost:8083/api/tools/spec

# Test memory
curl -X POST http://localhost:8082/api/memory/append \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test", "role": "USER", "content": "Hello"}'
```

## 🔧 Services

### Agent Service (Port 8080)

- **Main Chat Endpoint**: `/api/chat/stream` - Server-Sent Events streaming chat
- **Voice Endpoint**: `/api/chat/voice` - Voice chat (coming soon)
- **WebSocket**: `/ws/voice` - Real-time voice communication

Features:
- OpenAI GPT-4 integration
- Streaming responses
- Tool orchestration
- JWT-based security
- Rate limiting

### Memory Service (Port 8082)

- **Save Message**: `POST /api/memory/append`
- **Get Context**: `POST /api/memory/context`

Features:
- PostgreSQL persistence
- Session-based message storage
- Automatic cleanup of old messages

### Tools Service (Port 8083)

- **Tools Spec**: `GET /api/tools/spec`
- **Execute Tool**: `POST /api/tools/execute/{name}`

Available Tools:
- **Notes Tool**: Save, retrieve, and list notes
- **Web Search Tool**: Search the web (mock implementation)

## 🛠️ Development

### Project Structure

```
src/main/java/com/buddy/
├─ agent/           # Agent service
│  ├─ controller/   # REST controllers
│  ├─ service/      # Business logic
│  ├─ client/       # HTTP clients
│  ├─ openai/       # OpenAI integration
│  └─ config/       # Configuration
├─ tools/           # Tools service
│  ├─ controller/   # Tool endpoints
│  └─ service/      # Tool implementations
├─ memory/          # Memory service
│  ├─ controller/   # Memory endpoints
│  ├─ service/      # Memory operations
│  └─ repository/   # Data access
└─ common/          # Shared components
   ├─ dto/          # Data transfer objects
   ├─ tool/         # Tool interfaces
   └─ memory/       # Memory entities
```

### Adding New Tools

1. Implement the `Tool` interface in `common`
2. Create your tool class in `tools-service/service/`
3. Register it in `ToolCatalog.initializeTools()`

Example:
```java
@Component
public class MyTool implements Tool {
    @Override
    public String getName() { return "my_tool"; }
    
    @Override
    public String getDescription() { return "Description of my tool"; }
    
    @Override
    public String getInputSchema() { return "String input"; }
    
    @Override
    public ToolResult execute(String input) {
        // Your tool logic here
        return ToolResult.success("Result");
    }
}
```

### Testing

```bash
# Run all tests
./gradlew test

# Run specific module tests
./gradlew :common:test
./gradlew :agent-service:test
./gradlew :tools-service:test
./gradlew :memory-service:test
```

## 🔒 Security

- JWT-based authentication
- CORS configuration
- Rate limiting per user
- Tool execution logging

## 📊 Monitoring

- Spring Boot Actuator endpoints
- Health checks
- Application metrics

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set proper `OPENAI_API_KEY` and `JWT_SECRET`
2. **Database**: Use production PostgreSQL instance
3. **Security**: Enable HTTPS, configure CORS properly
4. **Monitoring**: Add proper logging and monitoring
5. **Scaling**: Consider containerization with Kubernetes

### Docker Deployment

```bash
# Build images
./gradlew :agent-service:docker
./gradlew :memory-service:docker
./gradlew :tools-service:docker

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

---

**Buddy AI** - Your intelligent companion for the digital age! 🤖✨
