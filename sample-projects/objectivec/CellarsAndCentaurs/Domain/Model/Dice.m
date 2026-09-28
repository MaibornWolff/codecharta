#import "Dice.h"

NSInteger rollD20(void) {
    DiceRoll *d20Roll = [[[Dice alloc] initWithSides:20] roll];
    return d20Roll.result;
}

@implementation DiceRoll

- (instancetype)initWithSides:(NSInteger)sides result:(NSInteger)result {
    self = [super init];
    if (self) {
        _sides = sides;
        _result = result;
    }
    return self;
}

@end

@implementation Dice

- (instancetype)initWithSides:(NSInteger)sides {
    self = [super init];
    if (self) {
        _sides = sides;
    }
    return self;
}

- (DiceRoll *)roll {
    NSInteger result = (NSInteger)arc4random_uniform((uint32_t)self.sides) + 1;
    return [[DiceRoll alloc] initWithSides:self.sides result:result];
}

@end
