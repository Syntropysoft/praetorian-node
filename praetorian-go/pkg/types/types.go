package types

import "time"

// ValidationResult represents the result of a validation operation
type ValidationResult struct {
	Success  bool                    `json:"success"`
	Errors   []ValidationError       `json:"errors"`
	Warnings []ValidationWarning     `json:"warnings"`
	Metadata map[string]interface{}  `json:"metadata"`
}

// ValidationError represents a validation error
type ValidationError struct {
	Code    string                 `json:"code"`
	Message string                 `json:"message"`
	Severity string                `json:"severity"`
	Context map[string]interface{} `json:"context,omitempty"`
	Path    string                 `json:"path,omitempty"`
	Line    int                    `json:"line,omitempty"`
	Column  int                    `json:"column,omitempty"`
}

// ValidationWarning represents a validation warning
type ValidationWarning struct {
	Code    string                 `json:"code"`
	Message string                 `json:"message"`
	Severity string                `json:"severity"`
	Context map[string]interface{} `json:"context,omitempty"`
	Path    string                 `json:"path,omitempty"`
	Line    int                    `json:"line,omitempty"`
	Column  int                    `json:"column,omitempty"`
}

// ValidationContext provides context for validation operations
type ValidationContext struct {
	Environment string            `json:"environment"`
	ConfigPath  string            `json:"configPath"`
	Options     map[string]string `json:"options"`
	Timestamp   time.Time         `json:"timestamp"`
}

// ValidationRule represents a validation rule
type ValidationRule struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Severity    string                 `json:"severity"`
	Category    string                 `json:"category"`
	Config      map[string]interface{} `json:"config,omitempty"`
}

// PluginMetadata contains information about a plugin
type PluginMetadata struct {
	Name        string            `json:"name"`
	Version     string            `json:"version"`
	Description string            `json:"description"`
	Author      string            `json:"author"`
	License     string            `json:"license"`
	Rules       []ValidationRule  `json:"rules"`
}

// AuditResult represents the result of an audit operation
type AuditResult struct {
	Success     bool                    `json:"success"`
	Score       float64                 `json:"score"`
	Errors      []ValidationError       `json:"errors"`
	Warnings    []ValidationWarning     `json:"warnings"`
	Metadata    map[string]interface{}  `json:"metadata"`
	AuditType   string                  `json:"auditType"`
	Timestamp   time.Time               `json:"timestamp"`
	Duration    time.Duration           `json:"duration"`
}

// Configuration represents a parsed configuration file
type Configuration struct {
	Data   map[string]interface{} `json:"data"`
	Path   string                 `json:"path"`
	Format string                 `json:"format"`
	Size   int64                  `json:"size"`
}

// AuditConfig represents the configuration for audits
type AuditConfig struct {
	Files         []string            `yaml:"files" json:"files"`
	IgnoreKeys    []string            `yaml:"ignore_keys" json:"ignoreKeys"`
	RequiredKeys  []string            `yaml:"required_keys" json:"requiredKeys"`
	Environments  map[string]string   `yaml:"environments" json:"environments"`
}

// IsIgnoredKey checks if a key should be ignored
func (ac *AuditConfig) IsIgnoredKey(key string) bool {
	for _, ignoredKey := range ac.IgnoreKeys {
		if key == ignoredKey {
			return true
		}
	}
	return false
}

// ComparisonResult represents the result of comparing configurations
type ComparisonResult struct {
	Success      bool                    `json:"success"`
	MissingKeys  []string                `json:"missingKeys"`
	ExtraKeys    []string                `json:"extraKeys"`
	Differences  []KeyDifference         `json:"differences"`
	Metadata     map[string]interface{}  `json:"metadata"`
}

// KeyDifference represents a difference between configuration keys
type KeyDifference struct {
	Key      string      `json:"key"`
	Value1   interface{} `json:"value1"`
	Value2   interface{} `json:"value2"`
	File1    string      `json:"file1"`
	File2    string      `json:"file2"`
	Severity string      `json:"severity"`
}

// Constants for severity levels
const (
	SeverityError   = "error"
	SeverityWarning = "warning"
	SeverityInfo    = "info"
)

// Constants for audit types
const (
	AuditTypeSecurity    = "security"
	AuditTypeCompliance  = "compliance"
	AuditTypePerformance = "performance"
)

// Constants for configuration formats
const (
	FormatYAML = "yaml"
	FormatJSON = "json"
	FormatENV  = "env"
	FormatTOML = "toml"
) 