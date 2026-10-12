#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_ZENTAURENHOEHLE_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_ZENTAURENHOEHLE_H

#include "armor_class.h"

/*
 * Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
 */
typedef struct Zentaurenhoehle {
    ArmorClass ruestungsklasse;
    int groesse;
} Zentaurenhoehle;

Zentaurenhoehle zentaurenhoehle_new(int groesse);
const char *zentaurenhoehle_beschreibung(const Zentaurenhoehle *zentaurenhoehle);

#endif
