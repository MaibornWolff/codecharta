#ifndef DE_SOTS_CELLARSANDCENTAURS_ADAPTER_PERSISTENCE_CREATURE_REPOSITORY_H
#define DE_SOTS_CELLARSANDCENTAURS_ADAPTER_PERSISTENCE_CREATURE_REPOSITORY_H

#include "repository.h"
#include "creature_entity.h"

typedef CreatureEntity Entity;

typedef REPOSITORY_OF(Entity) CreatureRepository;

void creature_repository_save(CreatureRepository *repository, Entity entity);
Entity *creature_repository_find_one(CreatureRepository *repository, const char *id);
size_t creature_repository_count(const CreatureRepository *repository);

#endif
