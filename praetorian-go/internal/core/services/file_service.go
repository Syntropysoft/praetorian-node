package services

import (
	"fmt"

	"github.com/syntropysoft/praetorian/internal/core/adapters"
	"github.com/syntropysoft/praetorian/pkg/types"
)

// FileService handles file operations using adapters
type FileService struct {
	fileReader   adapters.FileReader
	fileFinder   adapters.FileFinder
	parserRegistry *adapters.ParserRegistry
}

// NewFileService creates a new file service
func NewFileService() *FileService {
	fileReader := adapters.NewFileSystemAdapter()
	fileFinder := adapters.NewFileFinderAdapter(fileReader)
	parserRegistry := adapters.NewParserRegistry()

	return &FileService{
		fileReader:     fileReader,
		fileFinder:     fileFinder,
		parserRegistry: parserRegistry,
	}
}

// LoadConfigurations loads and parses configuration files
func (fs *FileService) LoadConfigurations(basePath string, patterns []string) ([]types.Configuration, error) {
	// Find files
	filePaths, err := fs.fileFinder.FindFiles(basePath, patterns)
	if err != nil {
		return nil, fmt.Errorf("failed to find files: %w", err)
	}

	// Parse each file
	var configs []types.Configuration
	for _, filePath := range filePaths {
		config, err := fs.parseFile(filePath)
		if err != nil {
			return nil, fmt.Errorf("failed to parse %s: %w", filePath, err)
		}
		configs = append(configs, *config)
	}

	return configs, nil
}

// parseFile parses a single configuration file
func (fs *FileService) parseFile(filePath string) (*types.Configuration, error) {
	// Read file
	data, err := fs.fileReader.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	// Detect format
	format := fs.fileFinder.DetectFormat(filePath)

	// Parse with appropriate parser
	configData, err := fs.parserRegistry.ParseWithFormat(data, format)
	if err != nil {
		return nil, err
	}

	// Get file info
	info, err := fs.fileReader.Stat(filePath)
	if err != nil {
		return nil, err
	}

	return &types.Configuration{
		Data:   configData,
		Path:   filePath,
		Format: format,
		Size:   info.Size(),
	}, nil
}

// LoadAuditConfig loads the audit configuration
func (fs *FileService) LoadAuditConfig(configPath string) (*types.AuditConfig, error) {
	// Use YAML parser for audit config (always YAML)
	yamlParser := adapters.NewYAMLParser()
	configLoader := adapters.NewConfigLoaderAdapter(fs.fileReader, yamlParser)
	
	return configLoader.Load(configPath)
}

// GetDefaultAuditConfig returns the default audit configuration
func (fs *FileService) GetDefaultAuditConfig() *types.AuditConfig {
	yamlParser := adapters.NewYAMLParser()
	configLoader := adapters.NewConfigLoaderAdapter(fs.fileReader, yamlParser)
	
	return configLoader.GetDefaultConfig()
} 