# 🚀 Template - Praetorian Examples

**This is a template for creating new Praetorian examples. Copy this directory and customize it for your specific example.**

## 🎯 How to Use This Template

### 1. Create a New Example
```bash
# From the examples directory, run:
./create-example.sh [number] "[name]" "[directory]"

# Example:
./create-example.sh 03 "Security Audit" "security-audit"
```

### 2. Customize the Configuration
After creating your example, you need to modify these files:

#### **setup.sh**
- Change `EXAMPLE_NAME` to your example name
- Update `REQUIRED_FILES` array with your files
- Modify `COMMANDS` array with your specific commands
- Adjust `DIRECTORIES` array if needed

#### **run-tests.sh**
- Change `EXAMPLE_NAME` to your example name
- Update `TEST_CASES` array with your test files
- Modify `VALIDATION_COMMAND` if needed

#### **README.md**
- Replace all `[PLACEHOLDER]` text with your content
- Update the structure section
- Add your specific examples
- Customize the learning points

## 📁 Template Structure

```
template/
├── README.md              # Template documentation
├── setup.sh              # Template setup script
└── run-tests.sh          # Template test script
```

## 🔧 Template Features

- **Modular Configuration**: Easy to customize variables
- **Reusable Logic**: Common functionality already implemented
- **Clear Documentation**: Placeholders show what to change
- **Consistent Structure**: Follows the same pattern as other examples

## 📋 Placeholders to Replace

### In setup.sh:
- `Compliance Check` → Your example name
- `04-compliance-check` → Your example directory
- `[config1.yaml]` → Your configuration files
- `[broken1.yaml]` → Your error files

### In run-tests.sh:
- `Compliance Check` → Your example name
- `04-compliance-check` → Your example directory
- `[config1.yaml]` → Your configuration files
- `[TYPE_OF_TESTS]` → Type of tests (validation, audit, etc.)

### In README.md:
- `Compliance Check` → Your example name
- `Brief description of what this example does` → Brief description
- `what this example demonstrates` → What it demonstrates
- `[FEATURE_1]`, `[FEATURE_2]` → Your features
- `[LEARNING_POINT_1]` → What users learn

## 🚀 Quick Start

1. **Create the example:**
   ```bash
   ./create-example.sh 03 "My Example" "my-example"
   ```

2. **Navigate to it:**
   ```bash
   cd 03-my-example
   ```

3. **Customize the files:**
   - Edit setup.sh
   - Edit run-tests.sh
   - Edit README.md

4. **Add your files:**
   - Create configs/ directory with correct files
   - Create invalid/ directory with error files

5. **Test it:**
   ```bash
   ./setup.sh
   ./run-tests.sh
   ```

---

**Use this template to create consistent, well-structured Praetorian examples!** 🛡️ 