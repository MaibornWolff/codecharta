package application

import _ "embed"

//go:embed lair_manifest.txt
var lairManifest string

func LairManifest() string {
	return lairManifest
}
