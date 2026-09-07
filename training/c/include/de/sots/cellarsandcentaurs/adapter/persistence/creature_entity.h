#ifndef DE_SOTS_CELLARSANDCENTAURS_ADAPTER_PERSISTENCE_CREATURE_ENTITY_H
#define DE_SOTS_CELLARSANDCENTAURS_ADAPTER_PERSISTENCE_CREATURE_ENTITY_H

#define CREATURE_ENTITY_ID_LENGTH 37

typedef struct CreatureEntity {
    char id[CREATURE_ENTITY_ID_LENGTH];
} CreatureEntity;

CreatureEntity creature_entity_new(const char *id);

#endif
