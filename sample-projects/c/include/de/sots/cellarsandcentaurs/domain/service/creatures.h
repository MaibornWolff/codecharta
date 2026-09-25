#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_SERVICE_CREATURES_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_SERVICE_CREATURES_H

#include "../model/creature.h"
#include "../model/creature_id.h"

typedef struct Creatures {
    void *self;
    void (*save)(void *self, Creature *creature);
    Creature *(*find)(void *self, CreatureId id);
} Creatures;

#endif
