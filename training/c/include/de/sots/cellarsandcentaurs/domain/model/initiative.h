#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_INITIATIVE_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_INITIATIVE_H

#ifdef USE_DICE
#include "dice.h"
#endif

typedef struct Initiative {
    int bonus;
#ifdef USE_DICE
    DiceRoll roll;
#else
    int roll;
#endif
} Initiative;

int initiative_total(const Initiative *initiative);

#endif
