#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_FIGHTABLE_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_FIGHTABLE_H

struct Creature;

typedef struct Fightable {
    int (*attack)(struct Creature *self, struct Creature *target);
    int (*is_alive)(const struct Creature *self);
} Fightable;

#endif
