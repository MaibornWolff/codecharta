#include <stdlib.h>
#include <string.h>

#include "../../../include/de/sots/cellarsandcentaurs/domain/model/stable.h"

struct Stable {
    char name[32];
    int stalls;
    int occupied;
};

Stable *stable_new(const char *name, int stalls)
{
    Stable *stable = calloc(1, sizeof(struct Stable));
    strncpy(stable->name, name, sizeof(stable->name) - 1);
    stable->stalls = stalls;
    return stable;
}

int stable_free_stalls(const Stable *stable)
{
    return stable->stalls - stable->occupied;
}

void stable_free(Stable *stable)
{
    free(stable);
}
