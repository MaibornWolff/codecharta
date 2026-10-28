package app

import "example.com/m/util"

func Shadowed() {
	util := util.New()
	util.Helper()
}

func Parameter(util util.Tool) {
	util.Helper()
}
