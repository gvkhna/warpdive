package viewmodel

import (
	"github.com/gvkhna/warpdive/dive/image"
)

type LayerSelection struct {
	Layer                                                      *image.Layer
	BottomTreeStart, BottomTreeStop, TopTreeStart, TopTreeStop int
}
