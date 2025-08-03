package auditors

import (
	"fmt"

	"github.com/syntropysoft/praetorian/pkg/types"
)

// KeyAuditor handles key comparison audits
type KeyAuditor struct {
	config *types.AuditConfig
}

// NewKeyAuditor creates a new key auditor
func NewKeyAuditor(cfg *types.AuditConfig) *KeyAuditor {
	return &KeyAuditor{
		config: cfg,
	}
}

// Audit runs the key comparison audit
func (ka *KeyAuditor) Audit(configs []types.Configuration) (*types.AuditResult, error) {
	var errors []types.ValidationError
	var warnings []types.ValidationWarning

	if len(configs) < 2 {
		warnings = append(warnings, types.ValidationWarning{
			Code:     "INSUFFICIENT_FILES",
			Message:  "Need at least 2 files to compare",
			Severity: types.SeverityWarning,
		})

		return &types.AuditResult{
			Success:  true,
			Errors:   errors,
			Warnings: warnings,
			Metadata: map[string]interface{}{
				"filesCompared": len(configs),
				"rulesChecked":  1,
				"rulesPassed":   1,
				"rulesFailed":   0,
			},
		}, nil
	}

	// Extract all keys from all files
	fileKeys := make(map[string]map[string]bool)
	allKeys := make(map[string]bool)

	for _, config := range configs {
		keys := ka.extractAllKeys(config.Data)
		fileKeys[config.Path] = keys
		
		// Collect all unique keys
		for key := range keys {
			allKeys[key] = true
		}
	}

	// Check for missing keys in each file
	for filePath, keys := range fileKeys {
		for expectedKey := range allKeys {
			if !keys[expectedKey] && !ka.isIgnoredKey(expectedKey) {
				errors = append(errors, types.ValidationError{
					Code:     "MISSING_KEY",
					Message:  fmt.Sprintf("Key '%s' is missing in %s", expectedKey, filePath),
					Severity: types.SeverityError,
					Path:     expectedKey,
					Context: map[string]interface{}{
						"file":       filePath,
						"missingKey": expectedKey,
					},
				})
			}
		}
	}

	// Check for extra keys (warnings)
	for filePath, keys := range fileKeys {
		for extraKey := range keys {
			if ka.isExtraKey(extraKey, fileKeys, filePath) && !ka.isIgnoredKey(extraKey) {
				warnings = append(warnings, types.ValidationWarning{
					Code:     "EXTRA_KEY",
					Message:  fmt.Sprintf("Key '%s' is only present in %s", extraKey, filePath),
					Severity: types.SeverityWarning,
					Path:     extraKey,
					Context: map[string]interface{}{
						"file":     filePath,
						"extraKey": extraKey,
					},
				})
			}
		}
	}

	success := len(errors) == 0

	return &types.AuditResult{
		Success:  success,
		Errors:   errors,
		Warnings: warnings,
		Metadata: map[string]interface{}{
			"filesCompared": len(configs),
			"totalKeys":     len(allKeys),
			"rulesChecked":  1,
			"rulesPassed":   map[bool]int{true: 1, false: 0}[success],
			"rulesFailed":   map[bool]int{true: 0, false: 1}[success],
		},
	}, nil
}

// extractAllKeys extracts all keys from a nested map (recursive)
func (ka *KeyAuditor) extractAllKeys(obj interface{}) map[string]bool {
	return ka.extractAllKeysRecursive(obj, "")
}

// extractAllKeysRecursive is the recursive helper function
func (ka *KeyAuditor) extractAllKeysRecursive(obj interface{}, prefix string) map[string]bool {
	keys := make(map[string]bool)

	if obj == nil {
		return keys
	}

	switch v := obj.(type) {
	case map[string]interface{}:
		for key, value := range v {
			fullKey := key
			if prefix != "" {
				fullKey = prefix + "." + key
			}
			keys[fullKey] = true

			// Recursively extract nested keys
			if nestedKeys := ka.extractAllKeysRecursive(value, fullKey); len(nestedKeys) > 0 {
				for nestedKey := range nestedKeys {
					keys[nestedKey] = true
				}
			}
		}
	case map[interface{}]interface{}:
		for key, value := range v {
			keyStr := fmt.Sprintf("%v", key)
			fullKey := keyStr
			if prefix != "" {
				fullKey = prefix + "." + keyStr
			}
			keys[fullKey] = true

			// Recursively extract nested keys
			if nestedKeys := ka.extractAllKeysRecursive(value, fullKey); len(nestedKeys) > 0 {
				for nestedKey := range nestedKeys {
					keys[nestedKey] = true
				}
			}
		}
	}

	return keys
}

// isIgnoredKey checks if a key should be ignored
func (ka *KeyAuditor) isIgnoredKey(key string) bool {
	if ka.config == nil {
		return false
	}
	return ka.config.IsIgnoredKey(key)
}

// isExtraKey checks if a key is extra (only present in one file)
func (ka *KeyAuditor) isExtraKey(key string, fileKeys map[string]map[string]bool, currentFile string) bool {
	for filePath, keys := range fileKeys {
		if filePath != currentFile && keys[key] {
			return false
		}
	}
	return true
} 