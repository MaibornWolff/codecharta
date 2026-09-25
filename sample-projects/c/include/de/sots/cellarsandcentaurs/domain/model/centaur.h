#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_CENTAUR_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_CENTAUR_H

#include "creature.h"

typedef struct Centaur {
    Creature base;
    int bow_range;
} Centaur;

Centaur *centaur_new(CreatureId id);
int centaur_charge(Centaur *centaur, Creature *target);

#endif
