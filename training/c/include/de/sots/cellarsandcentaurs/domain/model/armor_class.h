#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_ARMOR_CLASS_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_ARMOR_CLASS_H

typedef struct ArmorClass {
    int base;
    int bonus;
    int total;
    const char *description;
} ArmorClass;

ArmorClass armor_class_new(int base, int bonus);
ArmorClass armor_class_new_described(int base, int bonus, const char *description);
int armor_class_get_total(const ArmorClass *armor_class);
void armor_class_set_bonus(ArmorClass *armor_class, int bonus);

#endif
