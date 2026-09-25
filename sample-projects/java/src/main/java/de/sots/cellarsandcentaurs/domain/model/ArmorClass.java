package de.sots.cellarsandcentaurs.domain.model;

import de.sots.cellarsandcentaurs.application.CreatureUtil;

public class ArmorClass {
    private final String description;
    private final int base;
    private final int bonus;

    public ArmorClass(int base, int bonus) {
        this(base, bonus, CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION);
    }

    public ArmorClass(int base, int bonus, String description) {
        this.description = description;
        this.base = base;
        this.bonus = bonus;
    }

    public int getTotal() {
        return base + bonus;
    }

    public String getDescription() {
        return description;
    }
}
