#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_CREATURE_ID_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_CREATURE_ID_H

#define CREATURE_ID_LENGTH 37

typedef struct CreatureId {
    char id[CREATURE_ID_LENGTH];
} CreatureId;

CreatureId creature_id_new(const char *id);

#endif
