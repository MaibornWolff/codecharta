#include "../../../include/de/sots/cellarsandcentaurs/domain/model/lair.h"

typedef struct LairKeeper {
    Lair lair;
    int portcullis;
} LairKeeper;

int lair_keeper_is_deep(const LairKeeper *keeper)
{
    return keeper->lair.depth > 3 ? 1 : 0;
}
