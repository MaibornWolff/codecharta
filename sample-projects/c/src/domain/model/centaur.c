#include <stdlib.h>

#include "../../../include/de/sots/cellarsandcentaurs/domain/model/centaur.h"
#include "dice_table.c"

typedef struct CentaurCharge {
    DiceTable table;
    int bonus;
} CentaurCharge;

Centaur *centaur_new(CreatureId id)
{
    Centaur *centaur = calloc(1, sizeof(Centaur));
    centaur->base.id = id;
    centaur->bow_range = dice_table_max(&DICE_TABLE_D20);
    return centaur;
}

int centaur_charge(Centaur *centaur, Creature *target)
{
    CentaurCharge charge = { DICE_TABLE_D20, centaur->bow_range / 10 };
    int damage = charge.table.average + charge.bonus;
    target->hit_points.current -= damage;
    return damage;
}
