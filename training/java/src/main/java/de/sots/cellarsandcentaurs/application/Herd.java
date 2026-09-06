package de.sots.cellarsandcentaurs.application;

import de.sots.cellarsandcentaurs.domain.model.Centaur;

import java.util.ArrayList;
import java.util.List;

public class Herd {
    private final List<Centaur> centaurs = new ArrayList<>();

    public int size() {
        return centaurs.size();
    }
}
