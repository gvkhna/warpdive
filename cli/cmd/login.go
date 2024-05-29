package cmd

import (
	"fmt"
	"net/url"
	"os"
	"os/user"
	"path/filepath"

	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Authenticate to the cli with your API Key",
	Run:   doLoginCmd,
}

func init() {
	rootCmd.AddCommand(loginCmd)
}

// doLoginCmd implements the login logic
func doLoginCmd(cmd *cobra.Command, args []string) {
	var apiKey string

	fmt.Print("Enter your API key: ")
	_, err := fmt.Scanln(&apiKey)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading API key: %v\n", err)
		os.Exit(1)
	}

	// Get the user's home directory
	usr, err := user.Current()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Cannot find the user home directory: %v\n", err)
		os.Exit(1)
	}
	configPath := filepath.Join(usr.HomeDir, ".warpdiverc")

	// Check if the WARPDIVE_ENDPOINT environment variable is set and is a valid URL
	endpoint := os.Getenv("WARPDIVE_ENDPOINT")
	if endpoint == "" {
		endpoint = "https://www.warpdive.xyz" // Default URL
		fmt.Println("Using default API endpoint.")
	} else {
		_, err := url.ParseRequestURI(endpoint)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Invalid URL in WARPDIVE_ENDPOINT: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Using custom API endpoint: %s\n", endpoint)
	}

	// Prepare the API key data in YAML format using the endpoint
	data := map[string]interface{}{
		endpoint: map[string]interface{}{
			"api_key": map[string]string{
				"value": apiKey,
			},
		},
	}
	fileData, err := yaml.Marshal(data)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error marshaling API key data: %v\n", err)
		os.Exit(1)
	}

	// Write the data to the .warpdiverc file
	err = os.WriteFile(configPath, fileData, 0600) // rw------- permissions
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error writing API key to file: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("API Key saved successfully to ~/.warpdiverc.")
}
