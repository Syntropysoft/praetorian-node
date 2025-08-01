#!/bin/bash

# 🚀 Setup Script for Compliance Check - Praetorian Examples
# This script prepares the environment for validation tests
# 
# CONFIGURATION:
# - Change EXAMPLE_NAME to match your example
# - Modify REQUIRED_FILES array for your files
# - Adjust COMMANDS array for your specific commands

set -e

# =============================================================================
# CONFIGURATION - MODIFY THESE VARIABLES FOR YOUR EXAMPLE
# =============================================================================

EXAMPLE_NAME="Compliance Check"
EXAMPLE_DIR="04-compliance-check"
PACKAGE_NAME="@syntropysoft/praetorian"

# Files that must exist for the example to work
REQUIRED_FILES=(
    "configs/compliant-app.yaml"
    "invalid/non-compliant-app.yaml"
)

# Commands to show in the help section
COMMANDS=(
    "praetorian audit --compliance configs/compliant-app.yaml"
    "praetorian audit --compliance invalid/non-compliant-app.yaml"
)

# Directories to create
DIRECTORIES=(
    "configs"
    "invalid"
    "logs"
)

# =============================================================================
# SCRIPT LOGIC - DON'T MODIFY BELOW THIS LINE
# =============================================================================

echo "🏛️  Praetorian Examples - $EXAMPLE_NAME"
echo "=============================================="

# Check if we're in the correct directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: You must run this script from examples/$EXAMPLE_DIR/"
    exit 1
fi

# Check if Praetorian is installed
if ! command -v praetorian &> /dev/null; then
    echo "📦 Installing Praetorian..."
    npm install -g $PACKAGE_NAME
fi

# Create directories if they don't exist
echo "📁 Creating directory structure..."
for dir in "${DIRECTORIES[@]}"; do
    mkdir -p "$dir"
done

# Copy .env file if it doesn't exist
if [ ! -f "configs/.env" ] && [ -f "configs/env.example" ]; then
    echo "📋 Copying environment variables file..."
    cp configs/env.example configs/.env
fi

# Check that configuration files exist
echo "🔍 Checking configuration files..."
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: File $file not found"
        exit 1
    fi
done

echo "✅ Setup completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "  1. Validate correct configurations:"

# Show commands
for cmd in "${COMMANDS[@]:0:2}"; do
    echo "     $cmd"
done

echo ""
echo "  2. See errors in incorrect configurations:"

# Show error commands
for cmd in "${COMMANDS[@]:2}"; do
    echo "     $cmd"
done

echo ""
echo "  3. Run all tests:"
echo "     ./run-tests.sh"
echo "" 