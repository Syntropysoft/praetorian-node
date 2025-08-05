# Missing Files Demo 🆕

This example demonstrates the new **automatic detection and creation of missing files** functionality in Praetorian CLI.

## 🎯 Objective

Show how Praetorian detects missing files and automatically creates empty structures based on `required_keys`.

## 📁 Project Structure

```
missing-files-demo/
├── praetorian.yaml          # Main configuration
├── config-dev.yaml          # ✅ Exists
├── config-prod.yaml         # ✅ Exists
└── config-staging.yaml      # ❌ Doesn't exist (will be created automatically)
```

## ⚙️ Configuration

### praetorian.yaml
```yaml
files:
  - config-dev.yaml
  - config-staging.yaml      # This file does NOT exist
  - config-prod.yaml

ignore_keys:
  - debug
  - temp

required_keys:
  - database.host
  - database.port
  - database.name
  - api.version
  - api.port
  - logging.level
```

### config-dev.yaml
```yaml
database:
  host: localhost
  port: 5432
  name: dev_db
  user: dev_user

api:
  version: v1
  port: 3000
  debug: true

logging:
  level: debug
  format: json
```

### config-prod.yaml
```yaml
database:
  host: prod-db.example.com
  port: 5432
  name: prod_db
  user: prod_user

api:
  version: v1
  port: 80
  debug: false

logging:
  level: info
  format: json
```

## 🚀 Execution

### Before validation
```bash
ls -la
# config-dev.yaml     ✅ Exists
# config-prod.yaml    ✅ Exists
# config-staging.yaml ❌ Doesn't exist
```

### Run validation
```bash
praetorian validate
```

### Expected output
```
🔍 Validating SyntropyLog Configuration...

📄 Praetorian configuration loaded:
{
  "files": [
    "config-dev.yaml",
    "config-staging.yaml",
    "config-prod.yaml"
  ],
  "ignore_keys": ["debug"],
  "required_keys": [
    "database.host",
    "database.port",
    "database.name",
    "api.version",
    "api.port",
    "logging.level"
  ]
}

⚠️  Missing files detected: config-staging.yaml
💡 Creating empty structure files...
✅ Created 1 empty structure file(s)

📄 Configuration files loaded:
[
  "config-dev.yaml",
  "config-staging.yaml",
  "config-prod.yaml"
]

📊 Validation Results:

❌ Configuration has errors:
  1. Key 'database.user' is missing in config-staging.yaml
  2. Key 'api.debug' is missing in config-staging.yaml
  3. Key 'logging.format' is missing in config-staging.yaml
```

### After validation
```bash
ls -la
# config-dev.yaml     ✅ Exists
# config-prod.yaml    ✅ Exists
# config-staging.yaml ✅ Created automatically
```

### Created file content
```yaml
# config-staging.yaml (created automatically)
database:
  host: null
  port: null
  name: null
api:
  version: null
  port: null
logging:
  level: null
```

## 🎉 Benefits

1. **No more errors** due to missing files
2. **Consistent structure** based on `required_keys`
3. **Smoother development** - just fill in the values
4. **Maintains SOLID** and declarative programming

## 🔧 Development Usage

1. **Configure** `praetorian.yaml` with `required_keys`
2. **Run** `praetorian validate`
3. **Fill** the values in the created files
4. **Validate** again to verify consistency

## 📝 Notes

- Created files have `null` values that must be replaced
- Structure is based on `required_keys` from `praetorian.yaml`
- If no `required_keys`, uses structure from existing files
- Files are created in the correct format (YAML/JSON) based on extension 