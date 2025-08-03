package adapters

import (
	"github.com/syntropysoft/praetorian/pkg/types"
)

// FileReader defines the interface for reading files
type FileReader interface {
	ReadFile(path string) ([]byte, error)
	Stat(path string) (FileInfo, error)
	Glob(pattern string) ([]string, error)
}

// FileInfo represents file information
type FileInfo interface {
	Size() int64
	Name() string
}

// ConfigParser defines the interface for parsing configuration files
type ConfigParser interface {
	Parse(data []byte) (map[string]interface{}, error)
	SupportsFormat(format string) bool
}

// FileFinder defines the interface for finding files
type FileFinder interface {
	FindFiles(basePath string, patterns []string) ([]string, error)
	DetectFormat(filePath string) string
}

// ConfigLoader defines the interface for loading configurations
type ConfigLoader interface {
	Load(configPath string) (*types.AuditConfig, error)
	GetDefaultConfig() *types.AuditConfig
} 