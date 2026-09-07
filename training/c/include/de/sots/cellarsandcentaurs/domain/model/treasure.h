#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_TREASURE_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_TREASURE_H

#include "dungeon_limits.h"

typedef struct TreasureHoard {
    int gold;
    int gems[DUNGEON_LIMITS_MAX_GEMS];
} TreasureHoard;

#endif
