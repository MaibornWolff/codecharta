#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_DICE_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_DICE_H

#include <stdlib.h>

typedef struct Dice {
    int sides;
} Dice;

typedef struct DiceRoll {
    Dice dice;
    int value;
} DiceRoll;

static inline DiceRoll dice_roll(Dice dice)
{
    DiceRoll roll = { dice, rand() % dice.sides + 1 };
    return roll;
}

static inline int roll_d20(void)
{
    Dice d20 = { 20 };
    DiceRoll d20_roll = dice_roll(d20);
    return d20_roll.value;
}

#endif
