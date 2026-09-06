#include "../../../include/de/sots/cellarsandcentaurs/domain/model/armor_class.h"
#include "../../../include/de/sots/cellarsandcentaurs/application/application.h"

ArmorClass armor_class_new(int base, int bonus)
{
    return armor_class_new_described(base, bonus, CREATURE_UTIL_STANDARD_ARMOR_CLASS_DESCRIPTION);
}

ArmorClass armor_class_new_described(int base, int bonus, const char *description)
{
    ArmorClass armor_class = { base, bonus, base + bonus, description };
    return armor_class;
}

int armor_class_get_total(const ArmorClass *armor_class)
{
    return armor_class->total;
}

void armor_class_set_bonus(ArmorClass *armor_class, int bonus)
{
    armor_class->bonus = bonus;
    armor_class->total = armor_class->base + bonus;
}
