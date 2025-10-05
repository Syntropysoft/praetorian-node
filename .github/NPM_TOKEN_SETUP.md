# 🔑 NPM Token Setup for Automatic Publishing

## Overview

To enable automatic publishing to NPM from GitHub Actions, you need to configure an NPM token with 2FA support.

## Step-by-Step Setup

### 1. 🔐 Enable 2FA on NPM (Required)

```bash
# Enable 2FA on your NPM account
npm profile enable-2fa auth-and-writes
```

Follow the prompts to:
- Install an authenticator app (Google Authenticator, Authy, etc.)
- Scan the QR code
- Enter the verification code

### 2. 🔑 Generate Automation Token

```bash
# Login to NPM (if not already logged in)
npm login

# Create an automation token for CI/CD
npm token create --type=automation
```

**Important**: 
- Use `--type=automation` for CI/CD
- Copy the token immediately (you won't see it again)
- The token will look like: `npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. 🏗️ Configure GitHub Secret

1. Go to your repository: `https://github.com/Syntropysoft/praetorian-node`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Paste the token from step 2
6. Click **"Add secret"**

### 4. ✅ Verify Setup

After configuring the token, the next push to `main` branch will:
- ✅ Automatically publish to NPM
- ✅ Create GitHub release
- ✅ Show "Publishing to NPM with 2FA token..." message

## Token Permissions

The automation token has the following permissions:
- ✅ **Publish packages** to NPM registry
- ✅ **Read package information**
- ✅ **Works with 2FA enabled accounts**
- ❌ **Cannot be used for interactive login**

## Troubleshooting

### Error: "npm ERR! 403 Forbidden"
- **Cause**: Token doesn't have publish permissions
- **Solution**: Regenerate token with `--type=automation`

### Error: "npm ERR! 401 Unauthorized"
- **Cause**: Invalid or expired token
- **Solution**: Generate new token and update GitHub secret

### Error: "npm ERR! 400 Bad Request - Package already exists"
- **Cause**: Package version already published
- **Solution**: Increment version in `package.json`

### Error: "npm ERR! 402 Payment Required"
- **Cause**: Account needs to be upgraded for private packages
- **Solution**: Use `--access public` (already configured)

## Security Best Practices

### ✅ Do:
- Use automation tokens for CI/CD
- Store tokens as GitHub secrets
- Regularly rotate tokens
- Use minimal required permissions

### ❌ Don't:
- Use personal access tokens for automation
- Commit tokens to code
- Share tokens in logs or messages
- Use tokens with excessive permissions

## Manual Publishing (Alternative)

If you prefer manual publishing:

```bash
# Build the project
npm run build

# Publish manually
npm publish --access public

# Create GitHub release manually
git tag v0.0.4-alpha
git push origin v0.0.4-alpha
```

## Package Information

- **Package Name**: `@syntropysoft/praetorian`
- **Current Version**: `v0.0.4-alpha`
- **Registry**: NPM Public Registry
- **Access**: Public

## Support

If you encounter issues:
1. Check NPM account 2FA is enabled
2. Verify token has automation type
3. Confirm GitHub secret is named `NPM_TOKEN`
4. Check repository permissions

---

**Note**: This setup ensures secure, automated publishing while maintaining NPM's security requirements.
