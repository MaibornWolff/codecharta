#include "../../../include/de/sots/cellarsandcentaurs/domain/model/zentaurenhoehle.h"

Zentaurenhoehle zentaurenhoehle_new(int groesse)
{
    Zentaurenhoehle zentaurenhoehle = { armor_class_new(10, 0), groesse };
    return zentaurenhoehle;
}

const char *zentaurenhoehle_beschreibung(const Zentaurenhoehle *zentaurenhoehle)
{
    return zentaurenhoehle->groesse > 0 ? "Größe der Höhle" : "";
}
