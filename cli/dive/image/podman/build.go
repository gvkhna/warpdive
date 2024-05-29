//go:build linux || darwin
// +build linux darwin

package podman

import (
	"fmt"
	"os"
)

func buildImageFromCli(buildArgs []string) (string, error) {
	if debug := os.Getenv("WARPDIVE_DEBUG"); debug != "" {
		fmt.Printf("PODMAN BUILD ARGS: %+v\n", buildArgs)
	}
	iidfile, err := os.CreateTemp("/tmp", "warpdive.*.iid")
	if err != nil {
		return "", err
	}
	defer os.Remove(iidfile.Name())

	allArgs := append([]string{"--iidfile", iidfile.Name()}, buildArgs...)
	err = runPodmanCmd("build", allArgs...)
	if debug := os.Getenv("WARPDIVE_DEBUG"); debug != "" {
		fmt.Printf("PODMAN RUN ARGS: %+v\n", buildArgs)
	}
	if err != nil {
		return "", err
	}

	imageId, err := os.ReadFile(iidfile.Name())
	if err != nil {
		return "", err
	}

	return string(imageId), nil
}
