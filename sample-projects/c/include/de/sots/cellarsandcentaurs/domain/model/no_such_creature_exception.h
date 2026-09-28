#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_NO_SUCH_CREATURE_EXCEPTION_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_NO_SUCH_CREATURE_EXCEPTION_H

#include "creature_id.h"

typedef struct NoSuchCreatureException {
    CreatureId id;
    char message[128];
} NoSuchCreatureException;

NoSuchCreatureException no_such_creature_exception_new(CreatureId id);
const char *no_such_creature_exception_message(const NoSuchCreatureException *exception);

#endif
