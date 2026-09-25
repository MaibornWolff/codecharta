#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_SPEED_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_SPEED_H

typedef struct Speed {
    int feet_per_round;
} Speed;

static inline Speed speed_new(int feet_per_round)
{
    Speed speed = { feet_per_round };
    return speed;
}

static inline int speed_get_feet_per_round(const Speed *speed)
{
    return speed->feet_per_round;
}

#endif
