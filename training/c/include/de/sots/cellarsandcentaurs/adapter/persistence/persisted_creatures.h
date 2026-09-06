#ifndef DE_SOTS_CELLARSANDCENTAURS_ADAPTER_PERSISTENCE_PERSISTED_CREATURES_H
#define DE_SOTS_CELLARSANDCENTAURS_ADAPTER_PERSISTENCE_PERSISTED_CREATURES_H

#include "creature_repository.h"
#include "../../domain/service/creatures.h"

typedef struct PersistedCreatures {
    Creatures port;
    CreatureRepository *repository;
} PersistedCreatures;

PersistedCreatures persisted_creatures_new(CreatureRepository *repository);
Creatures *persisted_creatures_as_creatures(PersistedCreatures *persisted);

#endif
