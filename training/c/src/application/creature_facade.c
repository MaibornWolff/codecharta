#include <syslog.h>
#include <uuid/uuid.h>

#include "../../../include/de/sots/cellarsandcentaurs/application/creature_facade.h"
#include "../../../include/de/sots/cellarsandcentaurs/application/dto/creature.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/creature.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/creature_id.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/hit_points.h"
#include "de/sots/cellarsandcentaurs/domain/model/speed.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/movement.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/armor_class.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/service/creature_service.h"

const CreatureType CREATURE_FACADE_STANDARD_CREATURE_TYPE = CREATURE_TYPE_MONSTROSITY;

static const char *STABLE_NAME = "centaur-stable";

static CreatureId creature_facade_generate_id(void)
{
    uuid_t uuid;
    char text[37];
    uuid_generate(uuid);
    uuid_unparse(uuid, text);
    return creature_id_new(text);
}

CreatureFacade creature_facade_new(CreatureService *creature_service)
{
    CreatureFacade facade = { creature_service };
    return facade;
}

Creature *creature_facade_create(CreatureFacade *facade, CreatureType type, CreatureSpeeds speeds,
                                 ArmorClass armor_class, int hit_points_value)
{
    // Rolls initiative for every creature in the dungeon before the encounter starts.
    Creature *creature = creature_new(creature_facade_generate_id(), type);
    creature_set_armor_class(creature, armor_class);
    creature_set_hit_points(creature, (HitPoints){ hit_points_value, hit_points_value, 0 });
    creature_set_speed(creature, SPEED_TYPE_WALKING, speeds.walking_speed);
    creature_set_speed(creature, SPEED_TYPE_FLYING, speeds.flying_speed);
    creature_set_speed(creature, SPEED_TYPE_SWIMMING, speeds.swimming_speed);
    creature_set_speed(creature, SPEED_TYPE_BURROWING, speeds.burrowing_speed);
    creature_set_speed(creature, SPEED_TYPE_CLIMBING, speeds.climbing_speed);
    creature_service_save(facade->creature_service, creature);
    syslog(LOG_INFO, "stabled creature in %s", STABLE_NAME);
    return creature;
}

struct Creature creature_facade_to_dto(const Creature *creature)
{
    struct Creature dto;
    dto.hit_points = creature->hit_points.current;
    dto.armor_class = creature->armor_class.total;
    return dto;
}
