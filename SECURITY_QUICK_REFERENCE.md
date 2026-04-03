# 🔒 Security Quick Reference Guide

## Critical Environment Variables

```bash
# These MUST be set before starting the application
JWT_SECRET=<32+ character string>
ENCRYPTION_KEY=<64 character hex string>
DATABASE_URL=<mysql connection string>
NODE_ENV=production
```

## Generating Secure Keys

### Option 1: PowerShell (Windows)

```powershell
# JWT_SECRET (minimum 32 chars, base64-safe)
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) })) -replace '\\+|/|=' | Select-Object -First 43

# ENCRYPTION_KEY (exactly 64 hex chars)
[BitConverter]::ToString((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) })) -replace '-'
```

### Option 2: OpenSSL (Linux/macOS)

```bash
# JWT_SECRET
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32

# ENCRYPTION_KEY
openssl rand -hex 32
```

## File Upload Validation

All uploads now validate:

- ✅ MIME type (whitelist: JPEG, PNG, GIF, WebP, SVG)
- ✅ File extension
- ✅ File size (5-10MB limits)
- ✅ Filename sanitization

## Path Traversal Protection

Whitlisted folders only:

- ✅ lifestyle, life, sports, digestive
- ✅ sleep, addiction, allergies, sensitivity

Requests with `..` or invalid paths return 400 error.

## Rate Limiting

`/api/shared-access` is rate limited:

- 10 requests per minute per IP
- Returns HTTP 429 when exceeded
- Protects against brute force

## Error Handling

All errors return:

```json
{
  "error": "Generic safe message"
}
```

Never returns:

- ❌ Database details
- ❌ File paths
- ❌ System information

## Security Headers

The following are set automatically:

- ✅ X-User-ID, X-User-Email, X-User-Role (in protected API calls)
- ✅ HTTP-only cookies
- ✅ SameSite=Lax cookies

## To Apply These Fixes

1. **Copy `.env.example` to `.env`**

   ```bash
   cp .env.example .env
   ```

2. **Generate and set JWT_SECRET and ENCRYPTION_KEY**

   - Use commands above
   - Update `.env` file

3. **Test configuration**

   ```bash
   npm run build
   npm start
   ```

4. **Verify startup**
   - No errors about environment variables
   - Application loads successfully

## Common Issues

### "JWT_SECRET environment variable is not set"

**Fix**: Add JWT_SECRET to `.env` and restart

### "ENCRYPTION_KEY must be 64-character hexadecimal"

**Fix**: Generate new key with `openssl rand -hex 32`

### "Failed to create share link"

**Fix**: Generic error - check server logs for details

### "Invalid file type. Only image files allowed"

**Fix**: Upload only JPEG, PNG, GIF, WebP, or SVG files

### "File size exceeds maximum"

**Fix**: Reduce file size (max 10MB for images, 5MB for signatures)

## New Security Files

| File                       | Purpose                        |
| -------------------------- | ------------------------------ |
| `lib/security.ts`          | Security utility functions     |
| `.env.example`             | Configuration template         |
| `SECURITY_FIXES.md`        | Detailed vulnerability reports |
| `SECURITY_AUDIT_REPORT.md` | Full audit report              |
| `setup-security.sh`        | Linux/macOS setup script       |
| `setup-security.bat`       | Windows setup script           |

## Testing Security Fixes

```bash
# Test 1: File type validation
curl -F "file=@test.exe" http://localhost:3000/api/upload-image
# Expected: 400 error - Invalid file type

# Test 2: File size limit
curl -F "file=@large.jpg" http://localhost:3000/api/upload-image
# Expected: 413 if > 10MB

# Test 3: Path traversal
curl "http://localhost:3000/api/lifestyle-images?folder=../../../etc"
# Expected: 400 error - Invalid folder

# Test 4: Rate limiting (11 requests in 1 minute)
for i in {1..11}; do curl http://localhost:3000/api/shared-access; done
# Expected: 11th request returns 429

# Test 5: Error sanitization
curl http://localhost:3000/api/share-report
# Expected: { "error": "..." } without details
```

## Key Security Changes Summary

| Component      | Change               | Impact                       |
| -------------- | -------------------- | ---------------------------- |
| JWT Secret     | Required validation  | Prevents weak defaults       |
| Encryption Key | Format validation    | Prevents decryption failures |
| File Upload    | Type validation      | Prevents malicious files     |
| Path Handling  | Whitelist validation | Prevents directory traversal |
| Error Messages | Sanitized            | Prevents info disclosure     |
| API Rate Limit | 10/min per IP        | Prevents brute force         |
| Logging        | Safe messages        | Prevents log leaks           |

## Deployment Checklist

- [ ] Generate JWT_SECRET and ENCRYPTION_KEY
- [ ] Create `.env` file with all variables
- [ ] Add `.env` to `.gitignore`
- [ ] Run `npm run build` - verify success
- [ ] Run `npm start` - verify no startup errors
- [ ] Test file uploads
- [ ] Test rate limiting
- [ ] Enable HTTPS in production
- [ ] Review SECURITY_FIXES.md recommendations

## Need Help?

1. **Read SECURITY_FIXES.md** - Detailed vulnerability explanations
2. **Read SECURITY_AUDIT_REPORT.md** - Full audit findings
3. **Check setup-security.sh/bat** - Automated setup
4. **Enable NODE_ENV=development** - More detailed error logs for debugging

---

**Version**: 1.0  
**Last Updated**: February 27, 2026  
**Status**: ✅ All Critical Fixes Applied
