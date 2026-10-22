package app

import "example.com/m/model"

type Party struct{ leader model.Rider }

func Start() int {
	_ = model.Speed{}
	return model.NewDice()
}
