#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_HIT_POINTS_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_HIT_POINTS_H

#define MAX_HIT_POINTS 999

/**
 * Hit points drop when the creature takes damage and recover when it rests in its lair.
 */
typedef struct HitPoints {
    int current;
    int max;
    int temporary;
} HitPoints;

static inline HitPoints hit_points_init(int max)
{
    HitPoints hit_points = { max, max, 0 };
    return hit_points;
}

static inline void hit_points_take_damage(HitPoints *hit_points, int damage)
{
    hit_points->current -= damage;
}

static inline void hit_points_rest(HitPoints *hit_points)
{
    hit_points->current = hit_points->max;
}

#endif
