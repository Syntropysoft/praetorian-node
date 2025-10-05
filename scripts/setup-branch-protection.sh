#!/bin/bash

# 🛡️ Setup Branch Protection Script
# This script configures branch protection rules for the repository

set -e

echo "🛡️ Setting up branch protection rules..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   brew install gh"
    echo "   or visit: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI. Please run:"
    echo "   gh auth login"
    exit 1
fi

# Get repository name
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"

# Configure main branch protection
echo "🔧 Configuring main branch protection..."
gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["code-quality","test","build","security-audit"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

echo "✅ Main branch protection configured"

# Configure develop branch protection (if it exists)
if gh api repos/$REPO/branches/develop &> /dev/null; then
    echo "🔧 Configuring develop branch protection..."
    gh api repos/$REPO/branches/develop/protection \
      --method PUT \
      --field required_status_checks='{"strict":true,"contexts":["code-quality","test","build"]}' \
      --field enforce_admins=true \
      --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
      --field restrictions=null \
      --field allow_force_pushes=false \
      --field allow_deletions=false
    
    echo "✅ Develop branch protection configured"
else
    echo "ℹ️  Develop branch doesn't exist, skipping..."
fi

echo ""
echo "🎉 Branch protection setup complete!"
echo ""
echo "📋 Protection rules applied:"
echo "  - Require status checks before merging"
echo "  - Require code owner reviews"
echo "  - Require up-to-date branches"
echo "  - Dismiss stale reviews"
echo "  - Restrict force pushes"
echo "  - Restrict branch deletion"
echo ""
echo "🛡️ Your branches are now protected!"
