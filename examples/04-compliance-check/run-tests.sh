#!/bin/bash

# 🧪 Test Script for Compliance Check - Praetorian Examples
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

EXAMPLE_NAME="Compliance Check"
EXAMPLE_DIR="04-compliance-check"
VALIDATION_COMMAND="praetorian audit --compliance"

# Test cases: "file" "expected_result" "description"
TEST_CASES=(
    # Compliant configurations
    "configs/compliant-app.yaml" "SUCCESS" "Compliant application configuration"
    
    # Non-compliant configurations
    "invalid/non-compliant-app.yaml" "FAILURE" "Non-compliant application configuration"
)

# =============================================================================
# SCRIPT LOGIC - DON'T MODIFY BELOW THIS LINE
# =============================================================================

echo "🧪 Praetorian Examples - Running validation Tests"
echo "=========================================================="

# Check if we're in the correct directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: You must run this script from examples/$EXAMPLE_DIR/"
    exit 1
fi

# Check if Praetorian is installed
if ! command -v praetorian &> /dev/null; then
    echo "❌ Error: Praetorian is not installed. Run ./setup.sh first."
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

# Test counter
total_tests=0
passed_tests=0

# Run all test cases
echo ""
echo "📋 RUNNING ALL TESTS"
echo "===================="

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
    echo "  - Continue with [NEXT_EXAMPLE]"
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