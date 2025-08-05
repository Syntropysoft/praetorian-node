# Perfect Example - Configuration Validation

This example demonstrates how to create configurations that pass validation without errors.

## Structure

```
perfect-example/
├── praetorian.yaml      # Praetorian configuration
├── config-dev.yaml      # Development configuration
├── config-prod.yaml     # Production configuration
├── config-staging.yaml  # Staging configuration
└── README.md           # This file
```

## Features

✅ **Identical structure**: All files have exactly the same keys
✅ **No ignored keys**: No `ignore_keys` configured
✅ **Successful validation**: Passes without errors or warnings
✅ **Schematic**: Only 16 total keys for simplicity

## Required keys

All files contain these keys:

- `app.name`
- `app.environment`
- `app.port`
- `database.host`
- `database.port`
- `database.name`
- `api.base_url`
- `api.timeout`
- `api.retries`
- `logging.level`
- `logging.format`
- `logging.output`

## Usage

```bash
cd examples/validation/perfect-example
praetorian validate
```

## Expected result

```
📊 Validation Results:

✅ All files have consistent keys!

📈 Summary:
  • Files compared: 3
  • Total keys: 16
  • Duration: 0ms
```

## Applied principles

1. **Structural consistency**: Same keys across all environments
2. **Simplicity**: Few keys for easy understanding
3. **Clarity**: Different values but identical structure
4. **Functionality**: Example that actually works 