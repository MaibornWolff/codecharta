#include <stdio.h>

#include "../../../include/de/sots/cellarsandcentaurs/adapter/persistence/persisted_creatures.h"
#include "../../../include/de/sots/cellarsandcentaurs/adapter/persistence/creature_entity.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/creature.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/creature_id.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/no_such_creature_exception.h"
#include "../../../include/de/sots/cellarsandcentaurs/application/application.h"

static void persisted_creatures_save(void *self, Creature *creature)
{
    PersistedCreatures *persisted = self;
    creature_repository_save(persisted->repository, creature_entity_new(creature_get_id(creature)->id));
}

static Creature *persisted_creatures_find(void *self, CreatureId id)
{
    PersistedCreatures *persisted = self;
    CreatureEntity *entity = creature_repository_find_one(persisted->repository, id.id);
    if (entity == NULL) {
        NoSuchCreatureException exception = no_such_creature_exception_new(id);
        fputs(no_such_creature_exception_message(&exception), stderr);
        return NULL;
    }
    return creature_new(creature_id_new(entity->id), CREATURE_FACADE_STANDARD_CREATURE_TYPE);
}

PersistedCreatures persisted_creatures_new(CreatureRepository *repository)
{
    PersistedCreatures persisted;
    persisted.repository = repository;
    persisted.port.self = &persisted;
    persisted.port.save = persisted_creatures_save;
    persisted.port.find = persisted_creatures_find;
    return persisted;
}

Creatures *persisted_creatures_as_creatures(PersistedCreatures *persisted)
{
    return &persisted->port;
}
