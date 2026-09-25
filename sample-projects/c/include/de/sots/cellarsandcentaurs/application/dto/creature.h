#ifndef DE_SOTS_CELLARSANDCENTAURS_APPLICATION_DTO_CREATURE_H
#define DE_SOTS_CELLARSANDCENTAURS_APPLICATION_DTO_CREATURE_H

typedef struct Creature {
    char id[37];
    const char *type_name;
    int hit_points;
    int armor_class;
} Creature;

#endif
