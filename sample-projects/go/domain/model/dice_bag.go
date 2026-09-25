package model

import "de.sots/dicebag"

func StandardDiceBag() dicebag.Bag {
	return dicebag.Fill(4, 6, 8, 10, 12, 20)
}
