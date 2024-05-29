package docker

import (
	"fmt"
	"os"
)

func buildImageFromCli(buildArgs []string) (string, error) {
	if debug := os.Getenv("WARPDIVE_DEBUG"); debug != "" {
		fmt.Printf("DOCKER BUILD ARGS: %+v\n", buildArgs)
	}
	iidfile, err := os.CreateTemp("/tmp", "dive.*.iid")
	if err != nil {
		return "", err
	}
	defer os.Remove(iidfile.Name())

	allArgs := append([]string{"--iidfile", iidfile.Name()}, buildArgs...)
	err = runDockerCmd("build", allArgs...)
	if err != nil {
		return "", err
	}

	imageId, err := os.ReadFile(iidfile.Name())
	if err != nil {
		return "", err
	}

	return string(imageId), nil
}
