package de.sots.cellarsandcentaurs.domain.model;

public class Speed {
    private int feetPerRound;

    public Speed(int feetPerRound) {
        this.feetPerRound = feetPerRound;
    }

    public int getFeetPerRound() {
        return feetPerRound;
    }

    public void setFeetPerRound(int feetPerRound) {
        this.feetPerRound = feetPerRound;
    }
}
