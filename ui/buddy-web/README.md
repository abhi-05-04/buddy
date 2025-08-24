# Buddy Web UI

A production-ready React + Vite + TypeScript web application for the Buddy AI Assistant monorepo.

## Features

- **Chat Interface**: Real-time SSE streaming chat with Buddy AI
- **Voice Chat**: Record audio, STT transcription, and TTS playback
- **Notes Management**: Create, search, and manage notes via tools-service
- **Web Search**: Search the web using tools-service
- **Memory View**: Display conversation history from memory-service
- **Activity Log**: Real-time timeline of events and metrics
- **Settings**: Configure service URLs, JWT tokens, and preferences

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios with interceptors and retry logic
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **SSE**: Custom implementation with fetch and ReadableStream

## Prerequisites

- Node.js 18+ and npm
- Running Buddy backend services:
  - Agent Service (port 8080)
  - Memory Service (port 8082)
  - Tools Service (port 8083)

## Installation

1. Clone the repository and navigate to the UI directory:
   ```bash
   cd ui/buddy-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template:
   ```bash
   cp env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   VITE_AGENT_URL=http://localhost:8080
   VITE_TOOLS_URL=http://localhost:8083
   VITE_MEMORY_URL=http://localhost:8082
   VITE_JWT=dev-jwt-token
   VITE_TTS_AUTOPLAY=true
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Mobile Development

To access the UI from mobile devices on the same network:

1. **Automatic Setup** (Recommended):
   ```bash
   # Run the mobile setup script
   .\setup-mobile.ps1
   ```

2. **Manual Setup**:
   - Find your computer's IP address (e.g., `192.168.1.2`)
   - Update `.env` file with your IP:
     ```env
     VITE_AGENT_URL=http://192.168.1.2:8080
     VITE_TOOLS_URL=http://192.168.1.2:8083
     VITE_MEMORY_URL=http://192.168.1.2:8082
     ```
   - Access from mobile: `http://192.168.1.2:5173`

**Important Notes:**
- Both devices must be on the same network
- Windows Firewall may block connections - allow if prompted
- Backend services must be running and accessible

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Docker Deployment

Build the Docker image:
```bash
docker build -t buddy-web .
```

Run the container:
```bash
docker run -p 80:80 buddy-web
```

## API Integration

The application integrates with three backend services:

### Agent Service (Port 8080)
- `POST /api/chat/stream` - SSE streaming chat
- `POST /api/chat/voice/stt` - Speech-to-text
- `POST /api/chat/voice/tts` - Text-to-speech

### Tools Service (Port 8083)
- `GET /api/notes` - List notes
- `POST /api/notes` - Create note
- `DELETE /api/notes/{id}` - Delete note
- `POST /api/tools/execute/search` - Web search

### Memory Service (Port 8082)
- `POST /api/memory/context` - Get conversation history

## Features in Detail

### Chat Interface
- Real-time token streaming with SSE
- Support for stopping streams (Esc key)
- Copy transcript functionality
- Error handling and retry logic

### Voice Chat
- Native MediaRecorder for audio capture
- Automatic 30-second recording limit
- STT transcription to text
- TTS playback with audio controls
- Integration with chat interface

### Notes Management
- Create, read, and delete notes
- Local search functionality
- Optimistic updates
- Error handling

### Web Search
- Search query input
- Results display with external links
- Error handling for failed searches

### Memory View
- Display last 20 messages per session
- Role-based message badges
- Timestamp formatting
- Refresh functionality

### Activity Log
- Real-time event timeline
- Metrics dashboard (OpenAI calls, search calls, tool calls, tokens)
- Event filtering by type
- Search functionality
- JSON export capability

### Settings
- Service URL configuration
- JWT token management
- TTS autoplay toggle
- Service connectivity testing
- Persistent storage

## Keyboard Shortcuts

- **Esc**: Stop streaming chat
- **Enter**: Send message (in chat input)
- **Shift+Enter**: New line (in chat input)

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your backend services allow requests from the UI origin:
- Development: `http://localhost:5173`
- Production: Your deployed domain

### Authentication Issues
- Check JWT token in Settings
- Ensure token is valid and not expired
- Verify backend authentication is properly configured

### Service Connectivity
Use the "Test Connectivity" button in Settings to verify all services are reachable.

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── lib/                # Utility libraries (HTTP, SSE)
├── styles/             # Global styles and Tailwind config
├── env.ts              # Environment configuration
├── main.tsx            # Application entry point
└── App.tsx             # Main application component
```

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Include error handling
4. Test with the backend services
5. Update documentation as needed
