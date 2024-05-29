package cmd

import (
	"fmt"
	"io"
	"os"
	"path"
	"strings"

	"github.com/mitchellh/go-homedir"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/gvkhna/warpdive/dive"
	"github.com/gvkhna/warpdive/dive/filetree"
	"github.com/gvkhna/warpdive/runtime"
)

var cfgFile string
var exportFile string
var ciConfigFile string
var ciConfig = viper.New()
var isCi bool
var defaultSource string
var projectName string

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "warpdive [command] [IMAGE]",
	Short: "Docker/OCI Layer Browser",
	Long:  `Use warpdive-cli with https://warpdive.xyz to interactively browse and explore docker/OCI container images.`,
	Args:  cobra.MaximumNArgs(1),
	Run:   doAnalyzeCmd,
	Example: `
    # Build an image and push to warpdive.xyz
    warpdive build .

    # Fetch and push a build to warpdive.xyz
    warpdive push node:20-alpine -p node-alpine

    # Fetch and export a build locally
    warpdive export ubuntu:latest -o ubuntu.warpdive
    `,
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	initCli()
	cobra.OnInitialize(initConfig)
}

func initCli() {

	rootCmd.SetHelpCommand(&cobra.Command{
		Use:    "no-help", // You can make this anything, but "no-help" or similar is clear it does nothing
		Hidden: true,      // Hide the command so it doesn't appear in the list of available commands
	})

	defaultSource = runtime.GetDefaultEngine()
	rootCmd.PersistentFlags().StringVar(&defaultSource, "wd-source", defaultSource, "The container engine to use. ["+strings.Join(dive.ImageSources, "|")+"]")
	viper.BindPFlag("source", rootCmd.PersistentFlags().Lookup("source"))
	rootCmd.PersistentFlags().BoolP("version", "v", false, "display version number")
	rootCmd.PersistentFlags().BoolP("wd-ignore-errors", "i", false, "ignore image parsing errors and run the analysis anyway")
	viper.BindPFlag("ignore-errors", rootCmd.PersistentFlags().Lookup("ignore-errors"))
	// rootCmd.Flags().BoolVar(&isCi, "ci", false, "Skip the interactive TUI and validate against CI rules (same as env var CI=true)")
	// rootCmd.Flags().StringVarP(&exportFile, "output", "o", "", "Optional: Specify the path to output the .warpdive file. Open with warpdive.xyz/viewer")
	rootCmd.PersistentFlags().StringVar(&projectName, "wd-project", "", "Optional: Specify the project to push to") // . (Default: inferred from dir name)
	rootCmd.PersistentFlags().StringVar(&exportFile, "wd-export", "", "Optional: Exports a container image to a .warpdive file. For use with warpdive.xyz/viewer")
}

// initConfig reads in config file and ENV variables if set.
func initConfig() {
	var err error

	viper.SetDefault("container-engine", "docker")
	viper.SetDefault("ignore-errors", false)

	err = viper.BindPFlag("source", rootCmd.PersistentFlags().Lookup("source"))
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	viper.SetEnvPrefix("WARPDIVE")
	// replace all - with _ when looking for matching environment variables
	viper.SetEnvKeyReplacer(strings.NewReplacer("-", "_"))
	viper.AutomaticEnv()

	// if config files are present, load them
	if cfgFile == "" {
		// default configs are ignored if not found
		filepathToCfg := getDefaultCfgFile()
		viper.SetConfigFile(filepathToCfg)
	} else {
		viper.SetConfigFile(cfgFile)
	}
	err = viper.ReadInConfig()
	if err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	} else if cfgFile != "" {
		fmt.Println(err)
		os.Exit(0)
	}

	// set global defaults (for performance)
	filetree.GlobalFileTreeCollapse = viper.GetBool("filetree.collapse-dir")
}

// initLogging sets up the logging object with a formatter and location
func initLogging() {
	var logFileObj *os.File
	var err error

	if viper.GetBool("log.enabled") {
		logFileObj, err = os.OpenFile(viper.GetString("log.path"), os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0644)
		log.SetOutput(logFileObj)
	} else {
		log.SetOutput(io.Discard)
	}

	if err != nil {
		fmt.Fprintln(os.Stderr, err)
	}

	Formatter := new(log.TextFormatter)
	Formatter.DisableTimestamp = true
	log.SetFormatter(Formatter)

	level, err := log.ParseLevel(viper.GetString("log.level"))
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
	}

	log.SetLevel(level)
	log.Debug("Starting warpdive...")
	log.Debugf("config filepath: %s", viper.ConfigFileUsed())
	for k, v := range viper.AllSettings() {
		log.Debug("config value: ", k, " : ", v)
	}
}

// getDefaultCfgFile checks for config file in paths from xdg specs
// and in $HOME/.config/warpdive/ directory
// defaults to $HOME/.warpdive.yaml
func getDefaultCfgFile() string {
	home, err := homedir.Dir()
	if err != nil {
		fmt.Println(err)
		os.Exit(0)
	}

	xdgHome := os.Getenv("XDG_CONFIG_HOME")
	xdgDirs := os.Getenv("XDG_CONFIG_DIRS")
	xdgPaths := append([]string{xdgHome}, strings.Split(xdgDirs, ":")...)
	allDirs := append(xdgPaths, path.Join(home, ".config"))

	for _, val := range allDirs {
		file := findInPath(val)
		if len(file) > 0 {
			return file
		}
	}
	return path.Join(home, ".warpdive.yaml")
}

// findInPath returns first "*.yaml" file in path's subdirectory "warpdive"
// if not found returns empty string
func findInPath(pathTo string) string {
	directory := path.Join(pathTo, "warpdive")
	files, err := os.ReadDir(directory)
	if err != nil {
		return ""
	}

	for _, file := range files {
		filename := file.Name()
		if path.Ext(filename) == ".yaml" || path.Ext(filename) == ".yml" {
			return path.Join(directory, filename)
		}
	}
	return ""
}
