package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Config represents the configuration for audits
type Config struct {
	Files         []string            `yaml:"files"`
	IgnoreKeys    []string            `yaml:"ignore_keys"`
	RequiredKeys  []string            `yaml:"required_keys"`
	Environments  map[string]string   `yaml:"environments"`
}

// Loader handles configuration loading
type Loader struct{}

// NewLoader creates a new configuration loader
func NewLoader() *Loader {
	return &Loader{}
}

// Load loads the audit configuration from a file
func (l *Loader) Load(configPath string) (*Config, error) {
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	return &config, nil
}

// GetDefaultConfig returns a default configuration
func (l *Loader) GetDefaultConfig() *Config {
	return &Config{
		Files: []string{"*.yaml", "*.yml", "*.json"},
	}
}

// IsIgnoredKey checks if a key should be ignored
func (c *Config) IsIgnoredKey(key string) bool {
	for _, ignoredKey := range c.IgnoreKeys {
		if key == ignoredKey {
			return true
		}
	}
	return false
} 