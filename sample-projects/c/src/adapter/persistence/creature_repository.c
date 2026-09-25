#include <stdlib.h>
#include <string.h>

#include "../../../include/de/sots/cellarsandcentaurs/adapter/persistence/creature_repository.h"

static void creature_repository_grow(CreatureRepository *repository)
{
    size_t capacity = repository->capacity == 0 ? 8 : repository->capacity * 2;
    repository->items = realloc(repository->items, capacity * sizeof(Entity));
    repository->capacity = capacity;
}

void creature_repository_save(CreatureRepository *repository, Entity entity)
{
    if (repository->count == repository->capacity) {
        creature_repository_grow(repository);
    }
    repository->items[repository->count++] = entity;
}

Entity *creature_repository_find_one(CreatureRepository *repository, const char *id)
{
    for (size_t index = 0; index < repository->count; index++) {
        if (strcmp(repository->items[index].id, id) == 0) {
            return &repository->items[index];
        }
    }
    return NULL;
}

size_t creature_repository_count(const CreatureRepository *repository)
{
    return repository->count;
}
