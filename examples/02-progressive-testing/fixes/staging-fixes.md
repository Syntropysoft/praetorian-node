# 🔧 Staging Fixes - Progressive Testing Example

**How to fix the minor issues found in the staging configuration.**

## 🎯 Issues Found

### 1. **Hardcoded Database Password**
```yaml
# ❌ Current (Insecure)
credentials:
  password: "staging_password"

# ✅ Fixed (Secure)
credentials:
  password: "${DB_PASSWORD}"
```

**Why it's a problem:** Hardcoded secrets can be exposed in version control and logs.

**How to fix:** Use environment variables for all secrets.

### 2. **Too Permissive CORS**
```yaml
# ❌ Current (Too permissive)
cors:
  origin: "*"

# ✅ Fixed (Restricted)
cors:
  origin: ["https://staging.myapp.com", "https://admin-staging.myapp.com"]
```

**Why it's a problem:** Wildcard CORS allows any domain to make requests to your API.

**How to fix:** Specify exact allowed origins for your staging environment.

### 3. **Missing Security Headers**
```yaml
# ❌ Current (Missing headers)
headers:
  x-frame-options: "DENY"
  x-content-type-options: "nosniff"
  # Missing: x-xss-protection, strict-transport-security

# ✅ Fixed (Complete headers)
headers:
  x-frame-options: "DENY"
  x-content-type-options: "nosniff"
  x-xss-protection: "1; mode=block"
  strict-transport-security: "max-age=31536000; includeSubDomains"
```

**Why it's a problem:** Missing security headers leave your application vulnerable to attacks.

**How to fix:** Add all recommended security headers.

### 4. **No Authentication for Monitoring**
```yaml
# ❌ Current (No auth)
metrics:
  auth: false
  username: "admin"
  password: "metrics_password"

# ✅ Fixed (With auth)
metrics:
  auth: true
  username: "${METRICS_USER}"
  password: "${METRICS_PASSWORD}"
```

**Why it's a problem:** Unauthenticated monitoring endpoints can expose sensitive information.

**How to fix:** Enable authentication and use environment variables for credentials.

## 🚀 Quick Fix Script

```bash
#!/bin/bash
# Quick fix for staging configuration

echo "🔧 Applying staging fixes..."

# 1. Replace hardcoded password
sed -i 's/password: "staging_password"/password: "${DB_PASSWORD}"/' configs/staging.yaml

# 2. Fix CORS
sed -i 's/origin: "\*"/origin: ["https:\/\/staging.myapp.com", "https:\/\/admin-staging.myapp.com"]/' configs/staging.yaml

# 3. Add missing security headers
# (Manual edit required for complex changes)

# 4. Enable monitoring auth
sed -i 's/auth: false/auth: true/' configs/staging.yaml
sed -i 's/username: "admin"/username: "${METRICS_USER}"/' configs/staging.yaml
sed -i 's/password: "metrics_password"/password: "${METRICS_PASSWORD}"/' configs/staging.yaml

echo "✅ Staging fixes applied!"
```

## 📋 Checklist

- [ ] Replace hardcoded database password with environment variable
- [ ] Restrict CORS origins to specific domains
- [ ] Add missing security headers (XSS protection, HSTS)
- [ ] Enable authentication for monitoring endpoints
- [ ] Use environment variables for all credentials
- [ ] Test the configuration with Praetorian

## 🎯 Next Steps

After fixing staging issues, proceed to production configuration which has more critical errors that need immediate attention.

---

**Remember: Staging should be as close to production as possible, but with some flexibility for testing.** 🛡️ 