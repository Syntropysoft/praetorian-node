package adapters

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"strings"
	"bufio"
	"bytes"

	"gopkg.in/yaml.v3"
	"github.com/BurntSushi/toml"
	"github.com/hashicorp/hcl/v2/hclsimple"
)

// YAMLParser implements ConfigParser for YAML files
type YAMLParser struct{}

// NewYAMLParser creates a new YAML parser
func NewYAMLParser() *YAMLParser {
	return &YAMLParser{}
}

// Parse parses YAML data
func (yp *YAMLParser) Parse(data []byte) (map[string]interface{}, error) {
	var result map[string]interface{}
	if err := yaml.Unmarshal(data, &result); err != nil {
		return nil, fmt.Errorf("failed to parse YAML: %w", err)
	}
	return result, nil
}

// SupportsFormat checks if this parser supports the given format
func (yp *YAMLParser) SupportsFormat(format string) bool {
	return format == "yaml" || format == "yml"
}

// JSONParser implements ConfigParser for JSON files
type JSONParser struct{}

// NewJSONParser creates a new JSON parser
func NewJSONParser() *JSONParser {
	return &JSONParser{}
}

// Parse parses JSON data
func (jp *JSONParser) Parse(data []byte) (map[string]interface{}, error) {
	var result map[string]interface{}
	if err := json.Unmarshal(data, &result); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}
	return result, nil
}

// SupportsFormat checks if this parser supports the given format
func (jp *JSONParser) SupportsFormat(format string) bool {
	return format == "json"
}

// TOMLParser implements ConfigParser for TOML files
type TOMLParser struct{}

// NewTOMLParser creates a new TOML parser
func NewTOMLParser() *TOMLParser {
	return &TOMLParser{}
}

// Parse parses TOML data
func (tp *TOMLParser) Parse(data []byte) (map[string]interface{}, error) {
	var result map[string]interface{}
	if err := toml.Unmarshal(data, &result); err != nil {
		return nil, fmt.Errorf("failed to parse TOML: %w", err)
	}
	return result, nil
}

// SupportsFormat checks if this parser supports the given format
func (tp *TOMLParser) SupportsFormat(format string) bool {
	return format == "toml"
}

// PropertiesParser implements ConfigParser for .properties files
type PropertiesParser struct{}

// NewPropertiesParser creates a new Properties parser
func NewPropertiesParser() *PropertiesParser {
	return &PropertiesParser{}
}

// Parse parses .properties data
func (pp *PropertiesParser) Parse(data []byte) (map[string]interface{}, error) {
	result := make(map[string]interface{})
	lines := strings.Split(string(data), "\n")
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		
		// Skip empty lines and comments
		if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, "!") {
			continue
		}
		
		// Find the first equals sign
		eqIndex := strings.Index(line, "=")
		if eqIndex == -1 {
			continue
		}
		
		key := strings.TrimSpace(line[:eqIndex])
		value := strings.TrimSpace(line[eqIndex+1:])
		
		// Remove quotes if present
		if (strings.HasPrefix(value, "\"") && strings.HasSuffix(value, "\"")) ||
		   (strings.HasPrefix(value, "'") && strings.HasSuffix(value, "'")) {
			value = value[1 : len(value)-1]
		}
		
		if key != "" {
			result[key] = value
		}
	}
	
	return result, nil
}

// SupportsFormat checks if this parser supports the given format
func (pp *PropertiesParser) SupportsFormat(format string) bool {
	return format == "properties"
}

// INIParser implements ConfigParser for INI files
type INIParser struct{}

// NewINIParser creates a new INI parser
func NewINIParser() *INIParser {
	return &INIParser{}
}

// Parse parses INI data
func (ip *INIParser) Parse(data []byte) (map[string]interface{}, error) {
	result := make(map[string]interface{})
	currentSection := ""
	
	scanner := bufio.NewScanner(bytes.NewReader(data))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		
		// Skip empty lines and comments
		if line == "" || strings.HasPrefix(line, ";") || strings.HasPrefix(line, "#") {
			continue
		}
		
		// Check for section headers [section]
		if strings.HasPrefix(line, "[") && strings.HasSuffix(line, "]") {
			currentSection = line[1 : len(line)-1]
			result[currentSection] = make(map[string]interface{})
			continue
		}
		
		// Parse key=value pairs
		eqIndex := strings.Index(line, "=")
		if eqIndex == -1 {
			continue
		}
		
		key := strings.TrimSpace(line[:eqIndex])
		value := strings.TrimSpace(line[eqIndex+1:])
		
		// Remove quotes if present
		if (strings.HasPrefix(value, "\"") && strings.HasSuffix(value, "\"")) ||
		   (strings.HasPrefix(value, "'") && strings.HasSuffix(value, "'")) {
			value = value[1 : len(value)-1]
		}
		
		if key != "" {
			if currentSection != "" {
				if section, ok := result[currentSection].(map[string]interface{}); ok {
					section[key] = value
				}
			} else {
				result[key] = value
			}
		}
	}
	
	return result, nil
}

// SupportsFormat checks if this parser supports the given format
func (ip *INIParser) SupportsFormat(format string) bool {
	return format == "ini"
}

// HCLParser implements ConfigParser for HCL files
type HCLParser struct{}

// NewHCLParser creates a new HCL parser
func NewHCLParser() *HCLParser {
	return &HCLParser{}
}

// Parse parses HCL data
func (hp *HCLParser) Parse(data []byte) (map[string]interface{}, error) {
	var result map[string]interface{}
	if err := hclsimple.Decode("config.hcl", data, nil, &result); err != nil {
		return nil, fmt.Errorf("failed to parse HCL: %w", err)
	}
	return result, nil
}

// SupportsFormat checks if this parser supports the given format
func (hp *HCLParser) SupportsFormat(format string) bool {
	return format == "hcl"
}

// HOCONParser implements ConfigParser for HOCON files
type HOCONParser struct{}

// NewHOCONParser creates a new HOCON parser
func NewHOCONParser() *HOCONParser {
	return &HOCONParser{}
}

// Parse parses HOCON data (simplified implementation)
func (hcp *HOCONParser) Parse(data []byte) (map[string]interface{}, error) {
	// HOCON is a superset of JSON, so we'll use JSON parser as base
	// and extend it with HOCON-specific features
	var result map[string]interface{}
	
	// First try as JSON
	if err := json.Unmarshal(data, &result); err == nil {
		return result, nil
	}
	
	// If JSON fails, try simplified HOCON parsing
	// This is a basic implementation - full HOCON is complex
	result = make(map[string]interface{})
	lines := strings.Split(string(data), "\n")
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		
		// Skip empty lines and comments
		if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, "//") {
			continue
		}
		
		// Parse key=value or key:value
		separators := []string{"=", ":"}
		var key, value string
		var found bool
		
		for _, sep := range separators {
			if idx := strings.Index(line, sep); idx != -1 {
				key = strings.TrimSpace(line[:idx])
				value = strings.TrimSpace(line[idx+1:])
				found = true
				break
			}
		}
		
		if found && key != "" {
			// Remove quotes if present
			if (strings.HasPrefix(value, "\"") && strings.HasSuffix(value, "\"")) ||
			   (strings.HasPrefix(value, "'") && strings.HasSuffix(value, "'")) {
				value = value[1 : len(value)-1]
			}
			
			// Try to parse as number
			if strings.Contains(value, ".") {
				if f, err := parseFloat(value); err == nil {
					result[key] = f
					continue
				}
			}
			if i, err := parseInt(value); err == nil {
				result[key] = i
				continue
			}
			
			// Parse as boolean
			switch strings.ToLower(value) {
			case "true":
				result[key] = true
			case "false":
				result[key] = false
			default:
				result[key] = value
			}
		}
	}
	
	return result, nil
}

// parseFloat tries to parse a string as float
func parseFloat(s string) (float64, error) {
	var f float64
	_, err := fmt.Sscanf(s, "%f", &f)
	return f, err
}

// parseInt tries to parse a string as int
func parseInt(s string) (int, error) {
	var i int
	_, err := fmt.Sscanf(s, "%d", &i)
	return i, err
}

// SupportsFormat checks if this parser supports the given format
func (hcp *HOCONParser) SupportsFormat(format string) bool {
	return format == "hocon" || format == "conf"
}

// XMLConfig represents the XML configuration structure
type XMLConfig struct {
	XMLName xml.Name `xml:"configuration"`
	App     struct {
		Name        string `xml:"name"`
		Debug       string `xml:"debug"`
		Port        string `xml:"port"`
		Environment string `xml:"environment"`
	} `xml:"app"`
	Database struct {
		Host     string `xml:"host"`
		Port     string `xml:"port"`
		Name     string `xml:"name"`
		User     string `xml:"user"`
		Password string `xml:"password"`
		URL      string `xml:"url"`
	} `xml:"database"`
	API struct {
		BaseURL string `xml:"base_url"`
		Timeout string `xml:"timeout"`
		Retries string `xml:"retries"`
	} `xml:"api"`
	Logging struct {
		Level    string `xml:"level"`
		Format   string `xml:"format"`
		Output   string `xml:"output"`
		FilePath string `xml:"file_path"`
	} `xml:"logging"`
	Security struct {
		Enabled string `xml:"enabled"`
		CORS    struct {
			Origin      string `xml:"origin"`
			Credentials string `xml:"credentials"`
		} `xml:"cors"`
	} `xml:"security"`
}

// XMLParser implements ConfigParser for XML files
type XMLParser struct{}

// NewXMLParser creates a new XML parser
func NewXMLParser() *XMLParser {
	return &XMLParser{}
}

// Parse parses XML data
func (xp *XMLParser) Parse(data []byte) (map[string]interface{}, error) {
	var xmlConfig XMLConfig
	if err := xml.Unmarshal(data, &xmlConfig); err != nil {
		return nil, fmt.Errorf("failed to parse XML: %w", err)
	}
	
	// Convert to map[string]interface{}
	result := make(map[string]interface{})
	
	// App section
	app := make(map[string]interface{})
	app["name"] = xmlConfig.App.Name
	app["debug"] = xmlConfig.App.Debug
	app["port"] = xmlConfig.App.Port
	app["environment"] = xmlConfig.App.Environment
	result["app"] = app
	
	// Database section
	database := make(map[string]interface{})
	database["host"] = xmlConfig.Database.Host
	database["port"] = xmlConfig.Database.Port
	database["name"] = xmlConfig.Database.Name
	database["user"] = xmlConfig.Database.User
	database["password"] = xmlConfig.Database.Password
	database["url"] = xmlConfig.Database.URL
	result["database"] = database
	
	// API section
	api := make(map[string]interface{})
	api["base_url"] = xmlConfig.API.BaseURL
	api["timeout"] = xmlConfig.API.Timeout
	api["retries"] = xmlConfig.API.Retries
	result["api"] = api
	
	// Logging section
	logging := make(map[string]interface{})
	logging["level"] = xmlConfig.Logging.Level
	logging["format"] = xmlConfig.Logging.Format
	logging["output"] = xmlConfig.Logging.Output
	logging["file_path"] = xmlConfig.Logging.FilePath
	result["logging"] = logging
	
	// Security section
	security := make(map[string]interface{})
	security["enabled"] = xmlConfig.Security.Enabled
	cors := make(map[string]interface{})
	cors["origin"] = xmlConfig.Security.CORS.Origin
	cors["credentials"] = xmlConfig.Security.CORS.Credentials
	security["cors"] = cors
	result["security"] = security
	
	return result, nil
}

// SupportsFormat checks if this parser supports the given format
func (xp *XMLParser) SupportsFormat(format string) bool {
	return format == "xml"
}

// ParserRegistry manages multiple parsers
type ParserRegistry struct {
	parsers []ConfigParser
}

// NewParserRegistry creates a new parser registry
func NewParserRegistry() *ParserRegistry {
	return &ParserRegistry{
		parsers: []ConfigParser{
			NewYAMLParser(),
			NewJSONParser(),
			NewTOMLParser(),
			NewPropertiesParser(),
			NewINIParser(),
			NewHCLParser(),
			NewHOCONParser(),
			NewXMLParser(),
		},
	}
}

// GetParser returns the appropriate parser for the given format
func (pr *ParserRegistry) GetParser(format string) (ConfigParser, error) {
	for _, parser := range pr.parsers {
		if parser.SupportsFormat(format) {
			return parser, nil
		}
	}
	return nil, fmt.Errorf("no parser found for format: %s", format)
}

// ParseWithFormat parses data using the specified format
func (pr *ParserRegistry) ParseWithFormat(data []byte, format string) (map[string]interface{}, error) {
	parser, err := pr.GetParser(format)
	if err != nil {
		return nil, err
	}
	return parser.Parse(data)
} 