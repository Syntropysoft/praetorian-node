package core

import (
	"fmt"
	"time"

	"github.com/syntropysoft/praetorian/internal/core/auditors"
	"github.com/syntropysoft/praetorian/internal/core/services"
	"github.com/syntropysoft/praetorian/pkg/types"
)

// Auditor represents the main audit engine (orchestrator)
type Auditor struct {
	fileService *services.FileService
	keyAuditor  *auditors.KeyAuditor
}

// NewAuditor creates a new auditor instance
func NewAuditor() *Auditor {
	return &Auditor{
		fileService: services.NewFileService(),
	}
}

// RunAudit executes the audit based on the configuration
func (a *Auditor) RunAudit(auditType string, configPath string, configFile string) (*types.AuditResult, error) {
	startTime := time.Now()

	// Load configuration
	var cfg *types.AuditConfig
	var err error
	
	if configFile != "" {
		cfg, err = a.fileService.LoadAuditConfig(configFile)
		if err != nil {
			return nil, fmt.Errorf("failed to load config: %w", err)
		}
	} else {
		cfg = a.fileService.GetDefaultAuditConfig()
	}

	// Initialize key auditor
	a.keyAuditor = auditors.NewKeyAuditor(cfg)

	// Load configuration files
	configs, err := a.fileService.LoadConfigurations(configPath, cfg.Files)
	if err != nil {
		return nil, fmt.Errorf("failed to load config files: %w", err)
	}

	// Run the appropriate audit type
	var result *types.AuditResult
	switch auditType {
	case "security":
		result, err = a.runSecurityAudit(configs)
	case "compliance":
		result, err = a.runComplianceAudit(configs)
	case "performance":
		result, err = a.runPerformanceAudit(configs)
	case "all":
		result, err = a.runComprehensiveAudit(configs)
	default:
		return nil, fmt.Errorf("unknown audit type: %s", auditType)
	}

	if err != nil {
		return nil, err
	}

	// Set metadata
	result.Duration = time.Since(startTime)
	result.Timestamp = time.Now()
	result.AuditType = auditType

	return result, nil
}

// runComprehensiveAudit runs all audit types
func (a *Auditor) runComprehensiveAudit(configs []types.Configuration) (*types.AuditResult, error) {
	// For now, focus on key comparison (the core functionality from Node.js)
	return a.keyAuditor.Audit(configs)
}

// Placeholder audit methods for future implementation
func (a *Auditor) runSecurityAudit(configs []types.Configuration) (*types.AuditResult, error) {
	// TODO: Implement security audit
	return &types.AuditResult{
		Success: true,
		Warnings: []types.ValidationWarning{
			{
				Code:     "SECURITY_AUDIT_NOT_IMPLEMENTED",
				Message:  "Security audit not implemented yet",
				Severity: types.SeverityWarning,
			},
		},
		Metadata: map[string]interface{}{
			"auditType":    "security",
			"rulesChecked": 0,
			"rulesPassed":  0,
			"rulesFailed":  0,
		},
	}, nil
}

func (a *Auditor) runComplianceAudit(configs []types.Configuration) (*types.AuditResult, error) {
	// TODO: Implement compliance audit
	return &types.AuditResult{
		Success: true,
		Warnings: []types.ValidationWarning{
			{
				Code:     "COMPLIANCE_AUDIT_NOT_IMPLEMENTED",
				Message:  "Compliance audit not implemented yet",
				Severity: types.SeverityWarning,
			},
		},
		Metadata: map[string]interface{}{
			"auditType":    "compliance",
			"rulesChecked": 0,
			"rulesPassed":  0,
			"rulesFailed":  0,
		},
	}, nil
}

func (a *Auditor) runPerformanceAudit(configs []types.Configuration) (*types.AuditResult, error) {
	// TODO: Implement performance audit
	return &types.AuditResult{
		Success: true,
		Warnings: []types.ValidationWarning{
			{
				Code:     "PERFORMANCE_AUDIT_NOT_IMPLEMENTED",
				Message:  "Performance audit not implemented yet",
				Severity: types.SeverityWarning,
			},
		},
		Metadata: map[string]interface{}{
			"auditType":    "performance",
			"rulesChecked": 0,
			"rulesPassed":  0,
			"rulesFailed":  0,
		},
	}, nil
} 