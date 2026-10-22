package app

import (
	"example.com/m/go-yaml"
	"example.com/m/lib/v2"
	"example.com/m/mismatch-dir"
)

func Run() int { return yaml.Marshal() + lib.Open() + mismatched.Do() }
