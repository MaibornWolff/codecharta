#include <assert.h>
#include <string.h>

#include "../include/de/sots/cellarsandcentaurs/domain/service/creature_service.h"
#include "../include/de/sots/cellarsandcentaurs/domain/service/creatures.h"
#include "../include/de/sots/cellarsandcentaurs/domain/model/creature.h"
#include "../include/de/sots/cellarsandcentaurs/domain/model/speed.h"
#include "../include/de/sots/cellarsandcentaurs/domain/model/dice.h"

static Creature *saved_creature = NULL;

static void mock_save(void *self, Creature *creature)
{
    (void)self;
    saved_creature = creature;
}

static Creature *mock_find(void *self, CreatureId id)
{
    (void)self;
    (void)id;
    return saved_creature;
}

static void should_save_creature_to_the_stable(void)
{
    // Arrange
    Creatures creatures = { NULL, mock_save, mock_find };
    CreatureService service = creature_service_new(&creatures);
    Creature *creature = creature_new(creature_id_new("centaur-1"), CREATURE_TYPE_BEAST);
    Speed walkingSpeed = speed_new(40);
    creature_set_speed(creature, SPEED_TYPE_WALKING, walkingSpeed);

    // Act
    creature_service_save(&service, creature);

    // Assert
    assert(saved_creature == creature);
    assert(strcmp(creature_get_id(saved_creature)->id, "centaur-1") == 0);
    creature_free(creature);
}

static void should_roll_a_d20_between_one_and_twenty(void)
{
    // Arrange
    int d20Roll;

    // Act
    d20Roll = roll_d20();

    // Assert
    assert(d20Roll >= 1 && d20Roll <= 20);
}

int main(void)
{
    should_save_creature_to_the_stable();
    should_roll_a_d20_between_one_and_twenty();
    return 0;
}
