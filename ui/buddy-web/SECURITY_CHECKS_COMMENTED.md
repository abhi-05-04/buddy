# Security Checks Commented Out for Development

This document lists all the security checks that have been commented out in the Buddy Web UI for development purposes.

## ⚠️ WARNING
**These security checks should be re-enabled before deploying to production!**

## Files Modified

### 1. nginx.conf
**Security Headers Commented Out:**
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer-when-downgrade`
- `Content-Security-Policy: default-src 'self' http: https: data: blob: 'unsafe-inline'`

### 2. src/lib/http.ts
**Authentication & Headers Commented Out:**
- JWT token injection in axios instances
- Authorization header addition in request interceptors
- Authentication error handling (401/403 responses)
- JWT token update functions
- Content-Type header setting

### 3. src/store/app.ts
**JWT State Management Commented Out:**
- JWT state property in AppState interface
- setJwt action function
- JWT initialization from environment
- JWT persistence in localStorage

### 4. src/components/SettingsPanel.tsx
**JWT UI Components Commented Out:**
- JWT token input field
- JWT state management in component
- JWT token update calls
- JWT-related destructuring from store

### 5. src/env.ts
**JWT Environment Variable Commented Out:**
- VITE_JWT environment variable interface
- JWT environment variable initialization

### 6. env.example
**JWT Environment Example Commented Out:**
- VITE_JWT example value

### 7. src/components/SSEConsole.tsx
**SSE Headers Commented Out:**
- Authorization headers passed to SSE stream

### 8. src/components/VoiceRecorder.tsx
**Voice API Headers Commented Out:**
- Content-Type header for multipart/form-data

### 9. src/lib/sse.ts
**SSE Request Headers Commented Out:**
- Content-Type header for SSE requests

## Security Implications

### What's Disabled:
1. **Authentication**: No JWT token validation or injection
2. **CORS Protection**: Reduced header restrictions
3. **XSS Protection**: Browser XSS protection headers disabled
4. **Clickjacking Protection**: Frame embedding restrictions removed
5. **Content Type Sniffing**: MIME type sniffing protection disabled
6. **CSP**: Content Security Policy disabled

### Development Benefits:
1. **Easier Testing**: No authentication barriers
2. **Faster Development**: No security header conflicts
3. **Simplified Debugging**: Fewer security-related errors
4. **Local Development**: Works without proper JWT setup

## Re-enabling Security for Production

To re-enable security checks for production:

1. **Uncomment all security headers** in `nginx.conf`
2. **Uncomment JWT authentication** in all TypeScript files
3. **Restore Content-Type headers** in HTTP requests
4. **Re-enable authentication error handling**
5. **Update environment variables** to include proper JWT tokens
6. **Test authentication flow** thoroughly

## Files to Check Before Production:

- [ ] `nginx.conf` - Security headers
- [ ] `src/lib/http.ts` - Authentication & headers
- [ ] `src/store/app.ts` - JWT state management
- [ ] `src/components/SettingsPanel.tsx` - JWT UI
- [ ] `src/env.ts` - Environment variables
- [ ] `src/components/SSEConsole.tsx` - SSE headers
- [ ] `src/components/VoiceRecorder.tsx` - Voice API headers
- [ ] `src/lib/sse.ts` - SSE request headers

## Quick Re-enable Script

```bash
# Search for commented security code
grep -r "COMMENTED OUT FOR DEVELOPMENT" src/ nginx.conf

# Uncomment all security-related code
sed -i 's/\/\/ \(.*\) \/\/ COMMENTED OUT FOR DEVELOPMENT/\1/g' src/**/*.ts src/**/*.tsx nginx.conf
```

**Remember: Security should always be enabled in production environments!**
