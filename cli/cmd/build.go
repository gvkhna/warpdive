package cmd

import (
	"os"

	"github.com/spf13/cobra"

	"github.com/gvkhna/warpdive/dive"
	"github.com/gvkhna/warpdive/runtime"
)

// buildCmd represents the build command
var buildCmd = &cobra.Command{
	Use:                "build [any args to docker build]",
	Short:              "Builds and pushes a container image from a Dockerfile to warpdive.xyz",
	DisableFlagParsing: true,
	Run:                doBuildCmd,
}

func init() {
	rootCmd.AddCommand(buildCmd)
}

// doBuildCmd implements the steps taken for the build command
func doBuildCmd(cmd *cobra.Command, args []string) {
	// initLogging()

	var remainingArgs []string
	var sourceFlagValue string
	var foundSource bool
	var projectFlagValue string
	// var foundProject bool
	var exportFlagValue string
	var foundExport bool

	// Manual parsing to handle help, source, ignore-errors flags
	for i := 0; i < len(args); i++ {
		switch {
		case args[i] == "-h" || args[i] == "--help":
			cmd.Help()
			os.Exit(0) // Exit after displaying help, no further action required
		// case strings.HasPrefix(args[i], "--source="):
		// 	sourceFlagValue = strings.TrimPrefix(args[i], "--source=")
		// 	foundSource = true
		case args[i] == "--wd-source" && i+1 < len(args):
			sourceFlagValue = args[i+1]
			i++ // Skip the next item as it is the value for --source
			foundSource = true
		// case strings.HasPrefix(args[i], "--project="):
		// 	projectFlagValue = strings.TrimPrefix(args[i], "--project=")
		// 	foundProject = true
		case args[i] == "--wd-project" && i+1 < len(args):
			projectFlagValue = args[i+1]
			i++ // Skip the value next to the flag
			// foundProject = true

		case args[i] == "--wd-export" && i+1 < len(args):
			exportFlagValue = args[i+1]
			i++ // Skip the value next to the flag
			foundExport = true
		default:
			remainingArgs = append(remainingArgs, args[i])
		}
	}

	if !foundSource {
		sourceFlagValue = defaultSource // Use a default or manage missing source
	}

	if foundExport {
		exportFile = exportFlagValue
	}

	// fmt.Printf("Using engine: %s\n", sourceFlagValue)
	// fmt.Printf("Passing args to Docker: %v\n", remainingArgs)

	runtime.Run(runtime.Options{
		// Ci: isCi,
		// CiConfig:   ciConfig,
		// Source:     dive.ParseImageSource(engine),
		BuildArgs:  remainingArgs,
		Engine:     runtime.GetPreferredEngine(sourceFlagValue),
		ExportFile: exportFile,
		Project:    projectFlagValue,
		Source:     dive.ParseImageSource(sourceFlagValue),
	})
}
