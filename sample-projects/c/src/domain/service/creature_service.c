#include "../../../include/de/sots/cellarsandcentaurs/domain/service/creature_service.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/service/creatures.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/creature.h"

CreatureService creature_service_new(Creatures *creatures)
{
    CreatureService service = { creatures };
    return service;
}

void creature_service_save(CreatureService *service, Creature *creature)
{
    service->creatures->save(service->creatures->self, creature);
}
