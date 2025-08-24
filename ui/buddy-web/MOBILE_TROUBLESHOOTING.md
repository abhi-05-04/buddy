# Mobile Access Troubleshooting Guide

This guide helps resolve common issues when accessing the Buddy Web UI from mobile devices.

## Common Issues and Solutions

### 1. CORS Errors (Failed to load notes, create notes, etc.)

**Symptoms:**
- "Failed to load notes" error
- "Failed to create note" error
- Browser console shows CORS errors

**Solutions:**
1. **Restart Backend Services**: The CORS configuration has been updated to allow mobile IP addresses. Restart all services after the configuration changes.
2. **Check Environment Variables**: Ensure your `.env` file uses the correct IP address
3. **Verify Network Access**: Make sure mobile can reach the backend services
4. **Check for Bean Conflicts**: If you see "BeanDefinitionOverrideException", the CORS configuration has been fixed - just restart the services

### 2. Network Connection Issues

**Symptoms:**
- Page doesn't load
- "Connection refused" errors
- Timeout errors

**Solutions:**
1. **Check IP Address**: Ensure you're using the correct IP address
   ```bash
   # Find your IP address
   ipconfig
   ```
2. **Windows Firewall**: Allow connections for Node.js and Java applications
3. **Network Configuration**: Ensure both devices are on the same network

### 3. Backend Services Not Accessible

**Symptoms:**
- "Service offline" in Settings
- Connection timeouts
- 404 errors

**Solutions:**
1. **Check Service Status**: Verify all services are running
   ```bash
   # Check if services are listening on all interfaces
   netstat -an | findstr ":8080\|:8082\|:8083"
   ```
2. **Service Configuration**: Ensure services bind to `0.0.0.0` instead of `localhost`
3. **Port Forwarding**: Check if ports are blocked by firewall

### 4. Voice Recording Issues

**Symptoms:**
- "Failed to transcribe audio" error
- Microphone permission denied
- Audio recording doesn't work
- TTS (Text-to-Speech) fails

**Solutions:**
1. **Microphone Permissions**: 
   - Allow microphone access when prompted
   - Check browser settings if permission was denied
   - On mobile, ensure the site has microphone permissions
2. **Browser Compatibility**: Use modern browsers (Chrome, Safari, Firefox)
3. **HTTPS Requirements**: Some features require HTTPS in production
4. **Audio Format**: The app supports WebM, MP4, OGG, and WAV formats
5. **Network Issues**: Check if the agent service is running and accessible

### 5. Mobile Browser Issues

**Symptoms:**
- Page loads but features don't work
- JavaScript errors
- General functionality issues

**Solutions:**
1. **Browser Compatibility**: Use modern browsers (Chrome, Safari, Firefox)
2. **HTTPS Requirements**: Some features require HTTPS in production
3. **Permissions**: Allow microphone access when prompted

## Step-by-Step Setup

### 1. Automatic Setup (Recommended)
```bash
cd ui/buddy-web
.\setup-mobile.ps1
```

### 2. Manual Setup
1. Find your computer's IP address:
   ```bash
   ipconfig
   ```
2. Update `.env` file:
   ```env
   VITE_AGENT_URL=http://YOUR_IP:8080
   VITE_TOOLS_URL=http://YOUR_IP:8083
   VITE_MEMORY_URL=http://YOUR_IP:8082
   ```
3. Restart the UI:
   ```bash
   npm run dev
   ```

### 3. Test Connectivity
1. Open Settings in the UI
2. Click "Test Connectivity"
3. All services should show "Online"

## Network Configuration

### Windows Firewall
1. Open Windows Defender Firewall
2. Allow Node.js and Java applications
3. Or temporarily disable firewall for testing

### Service Binding
Ensure backend services bind to all interfaces:
- Spring Boot: `server.address=0.0.0.0`
- Vite: `host: true` (already configured)

### Router Configuration
- Ensure both devices are on the same network
- Check for any network restrictions
- Verify DHCP is working correctly

## Debugging Commands

### Check Network Connectivity
```bash
# From mobile device, ping the computer
ping 192.168.1.2

# Check if ports are open
telnet 192.168.1.2 8080
telnet 192.168.1.2 8082
telnet 192.168.1.2 8083
```

### Check Service Status
```bash
# Check if services are running
netstat -an | findstr ":8080\|:8082\|:8083"

# Test service endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:8083/api/tools/health
curl http://localhost:8082/api/memory/health

# Test voice endpoints (agent service)
curl -X POST http://localhost:8080/api/chat/voice/stt -F "file=@test.wav"
curl -X POST http://localhost:8080/api/chat/voice/tts -H "Content-Type: application/json" -d '{"text":"test"}'
```

### Check UI Status
```bash
# Test UI endpoint
curl http://localhost:5173

# Check Vite dev server
netstat -an | findstr ":5173"
```

## Common IP Addresses

- **Localhost**: `127.0.0.1` or `localhost`
- **Local Network**: Usually `192.168.x.x` or `10.x.x.x`
- **WiFi Network**: Check your router's DHCP range

## Browser Console Debugging

1. Open browser developer tools on mobile
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Look for CORS errors specifically

## Alternative Solutions

### 1. Use ngrok for Testing
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 5173

# Use the ngrok URL on mobile
```

### 2. Use USB Debugging (Android)
1. Enable USB debugging on Android
2. Connect via USB
3. Use `adb reverse` to forward ports

### 3. Use Browser Dev Tools
1. Open Chrome DevTools on desktop
2. Use device simulation
3. Test mobile features locally

## Still Having Issues?

1. Check the browser console for specific error messages
2. Verify all services are running and accessible
3. Test with a different mobile device or browser
4. Check network logs for connection attempts
5. Try accessing the backend services directly from mobile browser

## Support

If you're still experiencing issues:
1. Check the browser console for error messages
2. Verify network connectivity
3. Test with different browsers/devices
4. Check service logs for errors
