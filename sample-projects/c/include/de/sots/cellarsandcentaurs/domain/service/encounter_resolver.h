#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_SERVICE_ENCOUNTER_RESOLVER_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_SERVICE_ENCOUNTER_RESOLVER_H

#include "../model/creature.h"
#include "../model/dice.h"

#define ENCOUNTER_RESOLVER_MAX_FEET_PER_ROUND 120
#define ENCOUNTER_RESOLVER_DESCRIPTION_LENGTH 128

typedef enum Terrain {
    TERRAIN_CELLAR,
    TERRAIN_LAIR,
    TERRAIN_STABLE,
    TERRAIN_DUNGEON
} Terrain;

typedef struct CreatureQueue {
    const Creature *creature;
    const struct CreatureQueue *next;
} CreatureQueue;

typedef struct TextBuilder TextBuilder;

struct TextBuilder {
    TextBuilder *(*append)(TextBuilder *text, const char *part);
    TextBuilder *(*number)(TextBuilder *text, int value);
    const char *(*finish)(TextBuilder *text);
};

typedef struct EncounterResolver EncounterResolver;

TextBuilder *text_builder_on(char *buffer);

int encounter_resolver_resolve(const Creature *attacker, const Creature *defender, int roll, int bonus, Terrain terrain);
const char *encounter_resolver_describe(const Creature *creature);
int encounter_resolver_safe_roll(const Dice *dice);
int encounter_resolver_initiative_order(const CreatureQueue *creatures);
int encounter_resolver_is_empty(void);

#endif
