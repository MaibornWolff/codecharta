#import "CreatureId.h"

@implementation CreatureId

- (instancetype)initWithValue:(NSString *)value {
    self = [super init];
    if (self) {
        _value = [value copy];
    }
    return self;
}

+ (instancetype)creatureIdWithValue:(NSString *)value {
    return [[self alloc] initWithValue:value];
}

- (id)copyWithZone:(NSZone *)zone {
    return [[CreatureId allocWithZone:zone] initWithValue:self.value];
}

- (BOOL)isEqual:(id)object {
    if (![object isKindOfClass:[CreatureId class]]) {
        return NO;
    }
    return [self.value isEqualToString:((CreatureId *)object).value];
}

- (NSUInteger)hash {
    return self.value.hash;
}

@end
