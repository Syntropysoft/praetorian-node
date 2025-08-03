package main

import (
	"fmt"
	"os"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"github.com/syntropysoft/praetorian/internal/core"
	"github.com/syntropysoft/praetorian/pkg/types"
)

var (
	version = "0.0.1-alpha"
	commit  = "dev"
	date    = "unknown"
)

func main() {
	var rootCmd = &cobra.Command{
		Use:   "praetorian",
		Short: "Guardian of Configurations",
		Long: `Praetorian CLI – Universal Validation Framework for DevSecOps

🛡️  Guardian of Configurations & Security

Praetorian CLI is a multi-environment configuration validation tool designed for DevSecOps teams.
It ensures that your configuration files remain consistent across environments and detects 
critical differences before production deployments.

Perfect for:
• Microservices architectures with multiple config files
• Multi-environment deployments (dev, staging, prod)
• Security compliance and configuration drift detection
• CI/CD pipelines requiring config validation`,

		Version: fmt.Sprintf("%s (commit: %s, built: %s)", version, commit, date),
		PersistentPreRun: func(cmd *cobra.Command, args []string) {
			// Show banner on first run
			if cmd.Name() == "praetorian" {
				showBanner()
			}
		},
	}

	// Add commands
	rootCmd.AddCommand(newAuditCommand())
	rootCmd.AddCommand(newVersionCommand())

	// Execute
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

// showBanner displays the Praetorian banner
func showBanner() {
	cyan := color.New(color.FgCyan).SprintFunc()
	bold := color.New(color.Bold).SprintFunc()
	
	fmt.Println()
	fmt.Println(cyan(`  ____                 _             _                ____ _     ___ `))
	fmt.Println(cyan(` |  _ \ _ __ __ _  ___| |_ ___  _ __(_) __ _ _ __    / ___| |   |_ _|`))
	fmt.Println(cyan(` | |_) | '__/ _`) + bold(` |/ _ \ __/ _ \| '__| |/ _`) + cyan(` | '_ \  | |   | |    | | `))
	fmt.Println(cyan(` |  __/| | | (_| |  __/ || (_) | |  | | (_| | | | | | |___| |___ | | `))
	fmt.Println(cyan(` |_|   |_|  \__,_|\___|\__\___/|_|  |_|\__,_|_| |_|  \____|_____|___|`))
	fmt.Println()
	fmt.Println(cyan(`                                                                     `))
	fmt.Println(cyan(`🛡️  Guardian of Configurations & Security`))
	fmt.Println()
}



// newAuditCommand creates the audit command
func newAuditCommand() *cobra.Command {
	var auditType string
	var output string
	var configPath string
	var configFile string

	cmd := &cobra.Command{
		Use:   "audit",
		Short: "Run security and compliance audits",
		Long: `Run comprehensive security and compliance audits on configuration files.

Examples:
  praetorian audit                           # Run all audits on current directory
  praetorian audit --type security          # Run security audit only
  praetorian audit --path ./configs         # Audit specific directory
  praetorian audit --config praetorian.yaml # Use specific config file
  praetorian audit --output json            # Output in JSON format`,
		RunE: func(cmd *cobra.Command, args []string) error {
			fmt.Println("🔒 Starting Praetorian Audit...")
			fmt.Printf("📁 Path: %s\n", configPath)
			fmt.Printf("📄 Config: %s\n", configFile)
			fmt.Printf("🔍 Type: %s\n", auditType)
			fmt.Printf("📤 Output: %s\n", output)
			
			// Create auditor and run audit
			auditor := core.NewAuditor()
			result, err := auditor.RunAudit(auditType, configPath, configFile)
			if err != nil {
				return fmt.Errorf("audit failed: %w", err)
			}
			
			// Display results
			displayAuditResults(result, output)
			
			return nil
		},
	}

	cmd.Flags().StringVarP(&auditType, "type", "t", "all", "Audit type (security, compliance, performance, all)")
	cmd.Flags().StringVarP(&output, "output", "o", "text", "Output format (text, json, yaml)")
	cmd.Flags().StringVarP(&configPath, "path", "p", ".", "Path to configuration files")
	cmd.Flags().StringVarP(&configFile, "config", "c", "", "Configuration file path")

	return cmd
}



// newVersionCommand creates the version command
func newVersionCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "version",
		Short: "Show version information",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Printf("Praetorian CLI v%s\n", version)
			fmt.Printf("Commit: %s\n", commit)
			fmt.Printf("Built: %s\n", date)
			fmt.Printf("Go version: %s\n", "1.21+")
		},
	}

	return cmd
}

// displayAuditResults displays the audit results in the specified format
func displayAuditResults(result *types.AuditResult, outputFormat string) {
	fmt.Println("✅ Audit completed successfully!")
	fmt.Printf("📊 Duration: %v\n", result.Duration)
	fmt.Printf("🎯 Success: %v\n", result.Success)
	
	if len(result.Errors) > 0 {
		fmt.Printf("❌ Errors: %d\n", len(result.Errors))
		for _, err := range result.Errors {
			fmt.Printf("   • %s\n", err.Message)
		}
	}
	
	if len(result.Warnings) > 0 {
		fmt.Printf("⚠️  Warnings: %d\n", len(result.Warnings))
		for _, warning := range result.Warnings {
			fmt.Printf("   • %s\n", warning.Message)
		}
	}
	
	if result.Metadata != nil {
		if filesCompared, ok := result.Metadata["filesCompared"].(int); ok {
			fmt.Printf("📁 Files compared: %d\n", filesCompared)
		}
		if totalKeys, ok := result.Metadata["totalKeys"].(int); ok {
			fmt.Printf("🔑 Total keys: %d\n", totalKeys)
		}
	}
} 