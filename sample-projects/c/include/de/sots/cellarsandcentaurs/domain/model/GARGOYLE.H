#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_GARGOYLE_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_GARGOYLE_H

#include "hit_points.h"

typedef struct Gargoyle {
    HitPoints hit_points;
    int perch;
} Gargoyle;

static inline int gargoyle_is_perched(const Gargoyle *gargoyle)
{
    return gargoyle->perch > 0;
}

#endif
