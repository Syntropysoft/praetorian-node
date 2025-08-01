#!/bin/bash

# 🚀 Create Example Script - Praetorian Examples
# This script creates a new example by copying the template
#
# Usage: ./create-example.sh [example_number] [example_name] [example_dir]
# Example: ./create-example.sh 03 "Security Audit" "security-audit"

set -e

# =============================================================================
# CONFIGURATION
# =============================================================================

TEMPLATE_DIR="template"
EXAMPLES_DIR="."

# =============================================================================
# SCRIPT LOGIC
# =============================================================================

# Check if we have the required arguments
if [ $# -lt 3 ]; then
    echo "❌ Error: Missing required arguments"
    echo ""
    echo "Usage: $0 [example_number] [example_name] [example_dir]"
    echo ""
    echo "Arguments:"
    echo "  example_number: Number for the example (e.g., 03, 04, 05)"
    echo "  example_name:   Display name for the example (e.g., 'Security Audit')"
    echo "  example_dir:    Directory name (e.g., 'security-audit')"
    echo ""
    echo "Example:"
    echo "  $0 03 'Security Audit' 'security-audit'"
    echo ""
    exit 1
fi

EXAMPLE_NUMBER=$1
EXAMPLE_NAME=$2
EXAMPLE_DIR=$3
NEW_EXAMPLE_DIR="${EXAMPLE_NUMBER}-${EXAMPLE_DIR}"

echo "🏛️  Creating new Praetorian Example"
echo "====================================="
echo "Number: $EXAMPLE_NUMBER"
echo "Name: $EXAMPLE_NAME"
echo "Directory: $NEW_EXAMPLE_DIR"
echo ""

# Check if template exists
if [ ! -d "$TEMPLATE_DIR" ]; then
    echo "❌ Error: Template directory not found: $TEMPLATE_DIR"
    exit 1
fi

# Check if example already exists
if [ -d "$NEW_EXAMPLE_DIR" ]; then
    echo "❌ Error: Example directory already exists: $NEW_EXAMPLE_DIR"
    exit 1
fi

# Create the new example directory
echo "📁 Creating directory: $NEW_EXAMPLE_DIR"
mkdir -p "$NEW_EXAMPLE_DIR"

# Copy template files
echo "📋 Copying template files..."
cp -r "$TEMPLATE_DIR"/* "$NEW_EXAMPLE_DIR/"

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x "$NEW_EXAMPLE_DIR"/setup.sh
chmod +x "$NEW_EXAMPLE_DIR"/run-tests.sh

# Replace placeholders in files
echo "✏️  Replacing placeholders..."

# Replace in setup.sh
sed -i.bak "s/\[EXAMPLE_NAME\]/$EXAMPLE_NAME/g" "$NEW_EXAMPLE_DIR/setup.sh"
sed -i.bak "s/\[EXAMPLE_DIR\]/$NEW_EXAMPLE_DIR/g" "$NEW_EXAMPLE_DIR/setup.sh"
sed -i.bak "s/\[TYPE_OF_TESTS\]/validation/g" "$NEW_EXAMPLE_DIR/setup.sh"

# Replace in run-tests.sh
sed -i.bak "s/\[EXAMPLE_NAME\]/$EXAMPLE_NAME/g" "$NEW_EXAMPLE_DIR/run-tests.sh"
sed -i.bak "s/\[EXAMPLE_DIR\]/$NEW_EXAMPLE_DIR/g" "$NEW_EXAMPLE_DIR/run-tests.sh"
sed -i.bak "s/\[TYPE_OF_TESTS\]/validation/g" "$NEW_EXAMPLE_DIR/run-tests.sh"

# Replace in README.md
sed -i.bak "s/\[EXAMPLE_NAME\]/$EXAMPLE_NAME/g" "$NEW_EXAMPLE_DIR/README.md"
sed -i.bak "s/\[EXAMPLE_DIR\]/$NEW_EXAMPLE_DIR/g" "$NEW_EXAMPLE_DIR/README.md"
sed -i.bak "s/\[BRIEF_DESCRIPTION\]/Brief description of what this example does/g" "$NEW_EXAMPLE_DIR/README.md"
sed -i.bak "s/\[WHAT_THIS_EXAMPLE_DOES\]/what this example demonstrates/g" "$NEW_EXAMPLE_DIR/README.md"

# Clean up backup files
rm -f "$NEW_EXAMPLE_DIR"/*.bak

echo ""
echo "✅ Example created successfully!"
echo ""
echo "🎯 Next steps:"
echo "  1. Navigate to the new example:"
echo "     cd $NEW_EXAMPLE_DIR"
echo ""
echo "  2. Customize the configuration:"
echo "     - Edit setup.sh: Update REQUIRED_FILES, COMMANDS, DIRECTORIES"
echo "     - Edit run-tests.sh: Update TEST_CASES"
echo "     - Edit README.md: Update descriptions and examples"
echo ""
echo "  3. Create your configuration files:"
echo "     - Add files to configs/ directory"
echo "     - Add files to invalid/ directory"
echo ""
echo "  4. Test your example:"
echo "     ./setup.sh"
echo "     ./run-tests.sh"
echo ""
echo "🏛️  Happy coding with Praetorian!" 