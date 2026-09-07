package stable

type Ledger struct {
	stalls map[string]int
}

func NewLedger() *Ledger {
	return &Ledger{stalls: make(map[string]int)}
}

func (l *Ledger) Assign(stall string, creatureCount int) {
	l.stalls[stall] = creatureCount
}
