# 🛡️ Branch Protection Configuration

## Required Setup

To protect your main branch and ensure code quality, please configure the following branch protection rules:

### Main Branch Protection Rules

1. **Require status checks before merging**
   - ✅ code-quality
   - ✅ test
   - ✅ build
   - ✅ security-audit

2. **Require pull request reviews before merging**
   - ✅ Require review from code owners
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require review from CODEOWNERS

3. **Restrict pushes that create files**
   - ❌ Allow force pushes
   - ❌ Allow deletions

4. **Rules applied to administrators**
   - ✅ Include administrators

### Develop Branch Protection Rules

1. **Require status checks before merging**
   - ✅ code-quality
   - ✅ test
   - ✅ build

2. **Require pull request reviews before merging**
   - ✅ Require review from code owners
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require review from CODEOWNERS

3. **Restrict pushes that create files**
   - ❌ Allow force pushes
   - ❌ Allow deletions

## How to Configure

### Option 1: Manual Configuration (Recommended)
1. Go to your repository settings
2. Navigate to "Branches" section
3. Click "Add rule" for each branch (main, develop)
4. Apply the rules listed above

### Option 2: Automated Configuration
1. Go to the "Actions" tab
2. Run the "Setup Branch Protection" workflow manually
3. This will automatically configure branch protection rules

## Benefits

- 🛡️ **Prevents force pushes** that could overwrite history
- 🔍 **Requires code reviews** before merging
- ✅ **Ensures all checks pass** before merging
- 👥 **Code owner approval** required for sensitive changes
- 🚫 **Prevents branch deletion** by accident

## Status Checks Required

The following status checks must pass before merging:

- **code-quality**: ESLint, TypeScript compilation
- **test**: Unit tests, integration tests
- **build**: Project build verification
- **security-audit**: Security vulnerability scanning

## Code Owners

See `.github/CODEOWNERS` file for code owner configuration.

---

**Note**: This configuration ensures high code quality and prevents accidental changes to protected branches.
