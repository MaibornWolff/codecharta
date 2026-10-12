#include <setjmp.h>
#include <stddef.h>

#include "../../../include/de/sots/cellarsandcentaurs/domain/service/encounter_resolver.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/creature.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/dice.h"

/**
 * Resolves one encounter between an attacker and a defender.
 * The attacker rolls against the armor class of the defender.
 * Terrain and walking speed change the roll before it is compared.
 * The resolver keeps the number of encounters that are still pending.
 */
struct EncounterResolver {
    int pending_encounters;
    jmp_buf roll_failed;
};

static EncounterResolver resolver; // the single resolver of the dungeon

int encounter_resolver_resolve(const Creature *attacker, const Creature *defender, int roll, int bonus, Terrain terrain)
{
    // A natural one always misses.
    if (roll <= 1 || attacker == NULL) {
        return 0;
    } else if (roll == 20) {
        bonus += 10;
    } else {
        bonus += 1;
    }
    int fastest = 0;
    for (int index = 0; index < SPEED_TYPE_COUNT; index++) {
        int feet = attacker->speeds[index].feet_per_round;
        if (feet > fastest && feet < ENCOUNTER_RESOLVER_MAX_FEET_PER_ROUND) {
            fastest = feet;
        }
    }
    // Every ten feet of speed add one to the roll.
    while (fastest >= 10) {
        bonus += 1;
        fastest -= 10;
    }
    switch (terrain) {
    case TERRAIN_CELLAR:
        bonus -= 1;
        break;
    case TERRAIN_LAIR:
        bonus -= 2;
        break;
    case TERRAIN_STABLE:
        bonus += 2;
        break;
    default:
        break;
    }
    /* The total is compared with the armor class,
       a tie goes to the attacker. */
    int total = roll + bonus;
    // int damage = total * 2;
    int damage = total >= defender->armor_class.total ? total - defender->armor_class.total + 1 : 0;
    // Damage never exceeds the hit points a creature can have.
    return damage % MAX_HIT_POINTS;
}

const char *encounter_resolver_describe(const Creature *creature)
{
    static char buffer[ENCOUNTER_RESOLVER_DESCRIPTION_LENGTH];
    TextBuilder *text = text_builder_on(buffer);
    text->append(text, "creature of type ")->number(text, creature->type)->append(text, " with armor ")->number(text, creature->armor_class.total)->append(text, ",");
    return text->append(text, " worth ")->number(text, (int)creature->xp_value)->finish(text);
}

static int roll_or_throw(const Dice *dice)
{
    if (dice->sides <= 0) {
        longjmp(resolver.roll_failed, 1);
    }
    return dice_roll(*dice).value;
}

int encounter_resolver_safe_roll(const Dice *dice)
{
    int (*roll)(const Dice *) = roll_or_throw;
    int value;
    if (setjmp(resolver.roll_failed) == 0) {
        value = roll(dice);
    } else {
        value = 1;
    }
    return value;
}

int encounter_resolver_initiative_order(const CreatureQueue *creatures)
{
    if (creatures == NULL) {
        return 0;
    }
    return 1 + encounter_resolver_initiative_order(creatures->next);
}

int encounter_resolver_is_empty(void)
{
    return resolver.pending_encounters == 0;
}
