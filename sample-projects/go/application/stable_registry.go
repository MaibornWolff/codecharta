package application

import "de.sots/cellarsandcentaurs/internal/stable"

func RegisterStable() *stable.Ledger {
	return stable.NewLedger()
}
