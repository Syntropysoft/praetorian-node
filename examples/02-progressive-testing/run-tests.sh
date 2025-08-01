#!/bin/bash

# 🧪 Progressive Testing Script - Praetorian Examples
# This script demonstrates progressive validation by environment
# Shows how problems escalate from dev → staging → production

set -e

# =============================================================================
# CONFIGURATION - MODIFY THESE VARIABLES FOR YOUR EXAMPLE
# =============================================================================

EXAMPLE_NAME="Progressive Testing"
EXAMPLE_DIR="02-progressive-testing"
VALIDATION_COMMAND="praetorian validate"

# Test cases: "file" "expected_result" "description"
TEST_CASES=(
    # Development - Should be perfect
    "configs/dev.yaml" "SUCCESS" "Development configuration (Perfect)"
    
    # Staging - Should have warnings
    "configs/staging.yaml" "SUCCESS" "Staging configuration (Minor issues)"
    
    # Production - Should have critical errors
    "configs/production.yaml" "FAILURE" "Production configuration (Critical errors)"
)

# =============================================================================
# SCRIPT LOGIC - DON'T MODIFY BELOW THIS LINE
# =============================================================================

echo "🧪 Praetorian Examples - Progressive Testing"
echo "=============================================="
echo "This demonstrates how problems escalate across environments:"
echo "  DEV → STAGING → PRODUCTION"
echo ""

# Check if we're in the correct directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: You must run this script from examples/$EXAMPLE_DIR/"
    exit 1
fi

# Check if Praetorian is available
if ! command -v praetorian &> /dev/null; then
    echo "❌ Error: Praetorian is not available in PATH"
    echo "💡 Make sure to build and link Praetorian from the project root:"
    echo "   cd ../.. && npm run build && npm link"
    exit 1
fi

# Function to run validation and show result
run_validation() {
    local file=$1
    local expected_result=$2
    local description=$3
    
    echo ""
    echo "🔍 Testing: $description"
    echo "📁 File: $file"
    echo "🎯 Expected: $expected_result"
    echo "----------------------------------------"
    
    if $VALIDATION_COMMAND "$file" --verbose; then
        if [ "$expected_result" = "SUCCESS" ]; then
            echo "✅ PASSED: Validation successful as expected"
        else
            echo "❌ FAILED: Expected to fail but passed"
            return 1
        fi
    else
        if [ "$expected_result" = "FAILURE" ]; then
            echo "✅ PASSED: Validation failed as expected"
        else
            echo "❌ FAILED: Expected to pass but failed"
            return 1
        fi
    fi
}

# Function to show environment progression
show_progression() {
    echo ""
    echo "📊 ENVIRONMENT PROGRESSION ANALYSIS"
    echo "==================================="
    echo ""
    echo "🏗️  DEVELOPMENT (configs/dev.yaml)"
    echo "   ✅ Perfect configuration"
    echo "   ✅ All security best practices"
    echo "   ✅ Environment variables used"
    echo "   ✅ Proper logging and monitoring"
    echo ""
    echo "⚠️   STAGING (configs/staging.yaml)"
    echo "   ⚠️  Minor issues detected:"
    echo "   ⚠️  - 1 hardcoded secret"
    echo "   ⚠️  - Too permissive CORS"
    echo "   ⚠️  - Missing some security headers"
    echo "   ⚠️  - No authentication for monitoring"
    echo ""
    echo "🚨 PRODUCTION (configs/production.yaml)"
    echo "   ❌ Critical errors detected:"
    echo "   ❌ - Multiple hardcoded secrets"
    echo "   ❌ - SSL disabled"
    echo "   ❌ - Dangerous CORS configuration"
    echo "   ❌ - Missing all security headers"
    echo "   ❌ - Weak authentication settings"
    echo "   ❌ - Invalid logging configuration"
    echo ""
    echo "📈 PROBLEM ESCALATION:"
    echo "   DEV: 0 issues → STAGING: 4 issues → PRODUCTION: 8+ issues"
    echo ""
}

# Test counter
total_tests=0
passed_tests=0

# Run all test cases
echo "📋 RUNNING PROGRESSIVE TESTS"
echo "============================"

# Process test cases in groups of 3 (file, expected, description)
for ((i=0; i<${#TEST_CASES[@]}; i+=3)); do
    file="${TEST_CASES[i]}"
    expected="${TEST_CASES[i+1]}"
    description="${TEST_CASES[i+2]}"
    
    if run_validation "$file" "$expected" "$description"; then
        ((passed_tests++))
    fi
    ((total_tests++))
done

# Show progression analysis
show_progression

# Results summary
echo "📊 TEST SUMMARY"
echo "==============="
echo "Total tests: $total_tests"
echo "Passed tests: $passed_tests"
echo "Failed tests: $((total_tests - passed_tests))"

if [ $passed_tests -eq $total_tests ]; then
    echo ""
    echo "🎉 ALL TESTS PASSED!"
    echo "✅ Progressive testing demonstrates problem escalation correctly"
    echo ""
    echo "🎯 Key Learnings:"
    echo "  - Problems escalate from dev → staging → production"
    echo "  - Minor issues in staging become critical in production"
    echo "  - Security configurations must be environment-appropriate"
    echo "  - Validation helps catch issues early"
    echo ""
    echo "📚 Next Steps:"
    echo "  - Review fixes/staging-fixes.md for staging issues"
    echo "  - Review fixes/production-fixes.md for production issues"
    echo "  - Apply fixes in order: staging → production"
else
    echo ""
    echo "❌ SOME TESTS FAILED"
    echo "🔧 Review the errors and ensure Praetorian is working correctly"
    exit 1
fi

echo ""
echo "🏛️  Progressive testing completed successfully!" 