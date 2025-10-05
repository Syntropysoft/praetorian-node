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

# Check if main branch protection already exists
if gh api repos/$REPO/branches/main/protection >/dev/null 2>&1; then
    echo "ℹ️  Branch protection already exists for main branch"
else
    echo "🔧 Configuring main branch protection..."
    gh api repos/$REPO/branches/main/protection \
      --method PUT \
      --field required_status_checks='{"strict":true,"contexts":["code-quality","test","build","security-audit"]}' \
      --field enforce_admins=true \
      --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
      --field restrictions=null \
      --field allow_force_pushes=false \
      --field allow_deletions=false || {
        echo "❌ Failed to configure main branch protection"
        echo "💡 This might be due to insufficient permissions or the branch not existing"
        echo "📋 Please check:"
        echo "   - You have admin access to the repository"
        echo "   - The main branch exists"
        echo "   - Your GitHub token has the necessary permissions"
        exit 1
      }
    echo "✅ Main branch protection configured"
fi

# Configure develop branch protection (if it exists)
if gh api repos/$REPO/branches/develop &> /dev/null; then
    if gh api repos/$REPO/branches/develop/protection >/dev/null 2>&1; then
        echo "ℹ️  Branch protection already exists for develop branch"
    else
        echo "🔧 Configuring develop branch protection..."
        gh api repos/$REPO/branches/develop/protection \
          --method PUT \
          --field required_status_checks='{"strict":true,"contexts":["code-quality","test","build"]}' \
          --field enforce_admins=true \
          --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
          --field restrictions=null \
          --field allow_force_pushes=false \
          --field allow_deletions=false || {
            echo "❌ Failed to configure develop branch protection"
            echo "💡 This might be due to insufficient permissions"
            echo "📋 Please check your permissions and try again"
            exit 1
          }
        echo "✅ Develop branch protection configured"
    fi
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
