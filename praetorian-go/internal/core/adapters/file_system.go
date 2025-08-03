package adapters

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// FileSystemAdapter implements FileReader using the OS file system
type FileSystemAdapter struct{}

// NewFileSystemAdapter creates a new file system adapter
func NewFileSystemAdapter() *FileSystemAdapter {
	return &FileSystemAdapter{}
}

// ReadFile reads a file from the file system
func (fs *FileSystemAdapter) ReadFile(path string) ([]byte, error) {
	return os.ReadFile(path)
}

// Stat gets file information
func (fs *FileSystemAdapter) Stat(path string) (FileInfo, error) {
	info, err := os.Stat(path)
	if err != nil {
		return nil, err
	}
	return &fileInfo{info: info}, nil
}

// Glob finds files matching a pattern
func (fs *FileSystemAdapter) Glob(pattern string) ([]string, error) {
	return filepath.Glob(pattern)
}

// fileInfo implements FileInfo
type fileInfo struct {
	info os.FileInfo
}

func (fi *fileInfo) Size() int64 {
	return fi.info.Size()
}

func (fi *fileInfo) Name() string {
	return fi.info.Name()
}

// FileFinderAdapter implements FileFinder
type FileFinderAdapter struct {
	fileReader FileReader
}

// NewFileFinderAdapter creates a new file finder adapter
func NewFileFinderAdapter(fileReader FileReader) *FileFinderAdapter {
	return &FileFinderAdapter{
		fileReader: fileReader,
	}
}

// FindFiles finds configuration files in the given path
func (ff *FileFinderAdapter) FindFiles(basePath string, patterns []string) ([]string, error) {
	var files []string

	// If specific patterns are provided, use those
	if len(patterns) > 0 {
		for _, pattern := range patterns {
			matches, err := ff.fileReader.Glob(filepath.Join(basePath, pattern))
			if err != nil {
				return nil, fmt.Errorf("failed to glob pattern %s: %w", pattern, err)
			}
			files = append(files, matches...)
		}
		return files, nil
	}

	// Default: find all configuration files
	defaultPatterns := []string{"*.yaml", "*.yml", "*.json", "*.toml", "*.properties", "*.ini", "*.hcl", "*.conf", "*.xml"}
	for _, pattern := range defaultPatterns {
		matches, err := ff.fileReader.Glob(filepath.Join(basePath, pattern))
		if err != nil {
			return nil, fmt.Errorf("failed to glob pattern %s: %w", pattern, err)
		}
		files = append(files, matches...)
	}

	return files, nil
}

// DetectFormat detects the format of a configuration file
func (ff *FileFinderAdapter) DetectFormat(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))
	switch ext {
	case ".yaml", ".yml":
		return "yaml"
	case ".json":
		return "json"
	case ".toml":
		return "toml"
	case ".properties":
		return "properties"
	case ".ini":
		return "ini"
	case ".hcl":
		return "hcl"
	case ".conf":
		return "hocon"
	case ".xml":
		return "xml"
	case ".env":
		return "env"
	default:
		return "unknown"
	}
} 