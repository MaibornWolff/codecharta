#include "../../../include/de/sots/cellarsandcentaurs/domain/model/dice.h"

typedef struct DiceTable {
    Dice dice;
    int average;
} DiceTable;

static const DiceTable DICE_TABLE_D20 = { { 20 }, 10 };

static int dice_table_max(const DiceTable *table)
{
    return table->dice.sides;
}
