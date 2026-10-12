#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_SERVICE_ENCOUNTER_EDGE_CASES_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_SERVICE_ENCOUNTER_EDGE_CASES_H

#include <stddef.h>

#include "../model/speed.h"
#include "../model/treasure.h"
#include "../model/initiative.h"
#include "../model/armor_class.h"
#include "../model/hit_points.h"
#include "../model/lair.h"
#include "../model/movement.h"
#include "../model/creature.h"

#define EDGE_MAX(left, right) ((left) > (right) ? (left) : (right))

#define EDGE_CLAMP_ROLL(roll) \
    do {                      \
        if ((roll) > 20) {    \
            (roll) = 20;      \
        }                     \
    } while (0)

#define EDGE_DEFINE_GETTER(field)                 \
    int edge_get_##field(const Lair *lair)        \
    {                                             \
        return lair->field;                       \
    }

typedef int edge_handler(int roll);

typedef int (*EdgeSpeedCallback)(const Speed *speed);

union EdgePayload {
    TreasureHoard hoard;
    Initiative initiative;
};

struct EdgeRoom {
    struct {
        ArmorClass armor;
    } guard;
    HitPoints hit_points[2];
    unsigned int locked : 1;
};

static inline int edge_inline_bonus(int roll)
{
    return roll > 10 ? 1 : 0;
}

int edge_do_while(int rolls);
int edge_goto(int depth);
int edge_switch_fallthrough(int type);
int edge_tag_reference(struct Lair *lair, enum SpeedType type);
extern int edge_extern_prototype(const Creature *creature);

#endif
