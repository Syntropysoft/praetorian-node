package parser

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/syntropysoft/praetorian/pkg/types"
	"gopkg.in/yaml.v3"
)

// Parser handles file parsing operations
type Parser struct{}

// NewParser creates a new file parser
func NewParser() *Parser {
	return &Parser{}
}

// FindConfigFiles finds configuration files in the given path
func (p *Parser) FindConfigFiles(basePath string, patterns []string) ([]string, error) {
	var files []string

	// If specific patterns are provided, use those
	if len(patterns) > 0 {
		for _, pattern := range patterns {
			matches, err := filepath.Glob(filepath.Join(basePath, pattern))
			if err != nil {
				return nil, fmt.Errorf("failed to glob pattern %s: %w", pattern, err)
			}
			files = append(files, matches...)
		}
		return files, nil
	}

	// Default: find all yaml, yml, json files
	defaultPatterns := []string{"*.yaml", "*.yml", "*.json"}
	for _, pattern := range defaultPatterns {
		matches, err := filepath.Glob(filepath.Join(basePath, pattern))
		if err != nil {
			return nil, fmt.Errorf("failed to glob pattern %s: %w", pattern, err)
		}
		files = append(files, matches...)
	}

	return files, nil
}

// ParseConfigFiles parses all configuration files
func (p *Parser) ParseConfigFiles(filePaths []string) ([]types.Configuration, error) {
	var configs []types.Configuration

	for _, filePath := range filePaths {
		config, err := p.ParseConfigFile(filePath)
		if err != nil {
			return nil, fmt.Errorf("failed to parse %s: %w", filePath, err)
		}
		configs = append(configs, *config)
	}

	return configs, nil
}

// ParseConfigFile parses a single configuration file
func (p *Parser) ParseConfigFile(filePath string) (*types.Configuration, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var configData map[string]interface{}
	if err := yaml.Unmarshal(data, &configData); err != nil {
		return nil, err
	}

	info, err := os.Stat(filePath)
	if err != nil {
		return nil, err
	}

	return &types.Configuration{
		Data:   configData,
		Path:   filePath,
		Format: p.DetectFormat(filePath),
		Size:   info.Size(),
	}, nil
}

// DetectFormat detects the format of a configuration file
func (p *Parser) DetectFormat(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))
	switch ext {
	case ".yaml", ".yml":
		return types.FormatYAML
	case ".json":
		return types.FormatJSON
	case ".env":
		return types.FormatENV
	default:
		return "unknown"
	}
} 