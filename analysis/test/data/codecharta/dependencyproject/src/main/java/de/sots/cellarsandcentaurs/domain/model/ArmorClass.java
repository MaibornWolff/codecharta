package de.sots.cellarsandcentaurs.domain.model;

import de.sots.cellarsandcentaurs.application.CreatureUtil;

public class ArmorClass {
    private String description;
    private int base;
    private int bonus;
    private int total;

    public ArmorClass(int base, int bonus) {
        this(base, bonus, CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION);
    }

    public ArmorClass(int base, int bonus, String description) {
        this.description = description;
        this.base = base;
        this.bonus = bonus;
        this.total = base + bonus;
    }

    public int getBase() {
        return base;
    }

    public void setBase(int base) {
        this.base = base;
    }

    public int getBonus() {
        return bonus;
    }

    public void setBonus(int bonus) {
        this.bonus = bonus;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }
}
