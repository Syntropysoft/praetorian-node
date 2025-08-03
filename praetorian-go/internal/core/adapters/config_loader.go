package adapters

import (
	"fmt"

	"github.com/syntropysoft/praetorian/pkg/types"
)

// ConfigLoaderAdapter implements ConfigLoader using adapters
type ConfigLoaderAdapter struct {
	fileReader FileReader
	parser     ConfigParser
}

// NewConfigLoaderAdapter creates a new config loader adapter
func NewConfigLoaderAdapter(fileReader FileReader, parser ConfigParser) *ConfigLoaderAdapter {
	return &ConfigLoaderAdapter{
		fileReader: fileReader,
		parser:     parser,
	}
}

// Load loads the audit configuration from a file
func (cl *ConfigLoaderAdapter) Load(configPath string) (*types.AuditConfig, error) {
	data, err := cl.fileReader.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	configData, err := cl.parser.Parse(data)
	if err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	// Convert map to AuditConfig struct
	config := &types.AuditConfig{}
	
	if files, ok := configData["files"].([]interface{}); ok {
		config.Files = make([]string, len(files))
		for i, file := range files {
			if fileStr, ok := file.(string); ok {
				config.Files[i] = fileStr
			}
		}
	}

	if ignoreKeys, ok := configData["ignore_keys"].([]interface{}); ok {
		config.IgnoreKeys = make([]string, len(ignoreKeys))
		for i, key := range ignoreKeys {
			if keyStr, ok := key.(string); ok {
				config.IgnoreKeys[i] = keyStr
			}
		}
	}

	if requiredKeys, ok := configData["required_keys"].([]interface{}); ok {
		config.RequiredKeys = make([]string, len(requiredKeys))
		for i, key := range requiredKeys {
			if keyStr, ok := key.(string); ok {
				config.RequiredKeys[i] = keyStr
			}
		}
	}

	if environments, ok := configData["environments"].(map[string]interface{}); ok {
		config.Environments = make(map[string]string)
		for k, v := range environments {
			if vStr, ok := v.(string); ok {
				config.Environments[k] = vStr
			}
		}
	}

	return config, nil
}

// GetDefaultConfig returns a default configuration
func (cl *ConfigLoaderAdapter) GetDefaultConfig() *types.AuditConfig {
	return &types.AuditConfig{
		Files: []string{"*.yaml", "*.yml", "*.json", "*.toml", "*.properties", "*.ini", "*.hcl", "*.conf", "*.xml"},
	}
} 