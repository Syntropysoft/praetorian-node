#!/bin/bash

# 🧪 Test Script for Basic Validation - Praetorian Examples
# This script runs all validation tests
#
# CONFIGURATION:
# - Change EXAMPLE_NAME to match your example
# - Modify TEST_CASES array for your specific tests
# - Adjust VALIDATION_COMMAND if needed

set -e

# =============================================================================
# CONFIGURATION - MODIFY THESE VARIABLES FOR YOUR EXAMPLE
# =============================================================================

EXAMPLE_NAME="Basic Validation"
EXAMPLE_DIR="01-basic-validation"
VALIDATION_COMMAND="praetorian validate"

# Test cases: "framework" "file" "expected_result" "description"
TEST_CASES=(
    # Correct configurations
    "yaml" "configs/app.yaml" "SUCCESS" "Correct YAML configuration"
    "json" "configs/api.json" "SUCCESS" "Correct JSON configuration"
    "env" "configs/.env" "SUCCESS" "Correct environment variables"
    
    # Incorrect configurations
    "yaml" "invalid/app-broken.yaml" "FAILURE" "YAML configuration with errors"
    "json" "invalid/api-broken.json" "FAILURE" "JSON configuration with errors"
    "env" "invalid/env-broken" "FAILURE" "Environment variables with errors"
)

# =============================================================================
# SCRIPT LOGIC - DON'T MODIFY BELOW THIS LINE
# =============================================================================

echo "🧪 Praetorian Examples - Running Validation Tests"
echo "=========================================================="

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
    local framework=$1
    local file=$2
    local expected_result=$3
    local description=$4
    
    echo ""
    echo "🔍 Testing: $description"
    echo "📁 File: $file"
    echo "🎯 Expected: $expected_result"
    echo "----------------------------------------"
    
    if $VALIDATION_COMMAND "$framework" "$file" --verbose; then
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

# Test counter
total_tests=0
passed_tests=0

# Run all test cases
echo ""
echo "📋 RUNNING ALL TESTS"
echo "===================="

# Process test cases in groups of 4 (framework, file, expected, description)
for ((i=0; i<${#TEST_CASES[@]}; i+=4)); do
    framework="${TEST_CASES[i]}"
    file="${TEST_CASES[i+1]}"
    expected="${TEST_CASES[i+2]}"
    description="${TEST_CASES[i+3]}"
    
    if run_validation "$framework" "$file" "$expected" "$description"; then
        ((passed_tests++))
    fi
    ((total_tests++))
done

# Results summary
echo ""
echo "📊 TEST SUMMARY"
echo "======================"
echo "Total tests: $total_tests"
echo "Passed tests: $passed_tests"
echo "Failed tests: $((total_tests - passed_tests))"

if [ $passed_tests -eq $total_tests ]; then
    echo ""
    echo "🎉 ALL TESTS PASSED!"
    echo "✅ Praetorian is working correctly"
    echo ""
    echo "🎯 Next steps:"
    echo "  - Continue with 02-progressive-testing"
    echo "  - Try different options: --strict, --verbose"
    echo "  - Experiment with your own configurations"
else
    echo ""
    echo "❌ SOME TESTS FAILED"
    echo "🔧 Review the errors and make sure Praetorian is working"
    exit 1
fi

echo ""
echo "🏛️  Thank you for using Praetorian Examples!" 