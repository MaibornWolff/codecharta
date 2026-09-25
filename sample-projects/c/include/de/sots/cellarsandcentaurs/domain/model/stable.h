#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_STABLE_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_STABLE_H

typedef struct Stable Stable;

Stable *stable_new(const char *name, int stalls);
int stable_free_stalls(const Stable *stable);
void stable_free(Stable *stable);

#endif
