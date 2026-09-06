#include <stdio.h>
#include <string.h>

#include "../../../include/de/sots/cellarsandcentaurs/domain/model/no_such_creature_exception.h"

NoSuchCreatureException no_such_creature_exception_new(CreatureId id)
{
    NoSuchCreatureException exception;
    exception.id = id;
    snprintf(exception.message, sizeof(exception.message), "%s%s", "No such creature in the dungeon: ", id.id);
    return exception;
}

const char *no_such_creature_exception_message(const NoSuchCreatureException *exception)
{
    return exception->message;
}
