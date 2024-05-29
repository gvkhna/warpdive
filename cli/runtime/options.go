package runtime

import (
	"github.com/spf13/viper"

	"github.com/gvkhna/warpdive/dive"
)

type Options struct {
	BuildArgs    []string
	Ci           bool
	CiConfig     *viper.Viper
	Engine       string
	ExportFile   string
	IgnoreErrors bool
	Image        string
	Project      string
	PushArgs     []string
	Source       dive.ImageSource
}
