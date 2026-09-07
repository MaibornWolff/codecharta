//go:build unix

package application

import "de.sots/cellarsandcentaurs/domain/model"

func RestInLair(hitPoints model.HitPoints) model.HitPoints {
	return hitPoints.Rest()
}
