#import "ArmorClass.h"
#import "CellarsAndCentaurs.h"
#include "CreatureLimits.h"

@implementation ArmorClass

- (instancetype)initWithBase:(NSInteger)base bonus:(NSInteger)bonus {
    return [self initWithBase:base bonus:bonus description:CreatureUtil.standardArmorClassDescription];
}

- (instancetype)initWithBase:(NSInteger)base bonus:(NSInteger)bonus description:(NSString *)armorDescription {
    self = [super init];
    if (self) {
        _base = base;
        _bonus = bonus;
        _armorDescription = [armorDescription copy];
    }
    return self;
}

- (NSInteger)total {
    return self.base + self.bonus;
}

- (BOOL)isWithinLimits {
    return self.total >= MIN_ARMOR_CLASS && self.total <= MAX_ARMOR_CLASS;
}

@end
