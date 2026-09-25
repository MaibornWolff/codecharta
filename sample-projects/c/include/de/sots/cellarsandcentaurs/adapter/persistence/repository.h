#ifndef DE_SOTS_CELLARSANDCENTAURS_ADAPTER_PERSISTENCE_REPOSITORY_H
#define DE_SOTS_CELLARSANDCENTAURS_ADAPTER_PERSISTENCE_REPOSITORY_H

#include <stddef.h>

#define REPOSITORY_OF(T) \
    struct {             \
        T *items;        \
        size_t count;    \
        size_t capacity; \
    }

#define REPOSITORY_INIT { NULL, 0, 0 }

#endif
