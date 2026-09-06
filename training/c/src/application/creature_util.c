#include "../../../include/de/sots/cellarsandcentaurs/application/creature_util.h"

int creature_util_count_treasure_hoard(const Creature *creature)
{
    return (int)creature->xp_value * 10 + creature->armor_class.total;
}

int creature_util_is_centaur(const Creature *creature)
{
    const Centaur *centaur = (const Centaur *)creature;
    return centaur->bow_range > 0;
}
