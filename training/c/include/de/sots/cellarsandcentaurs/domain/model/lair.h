#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_LAIR_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_LAIR_H

#include "hit_points.h"

#define LAIR_REGENERATION_TYPE HitPoints

typedef struct Lair {
    LAIR_REGENERATION_TYPE regeneration;
    int depth;
} Lair;

#endif
