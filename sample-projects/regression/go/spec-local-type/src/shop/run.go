package shop

import "example.com/m/model"

func Run() int {
	type Mount struct{ rider model.Rider }
	_ = Mount{}
	return 1
}
