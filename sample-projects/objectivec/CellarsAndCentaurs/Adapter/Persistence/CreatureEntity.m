#import "CreatureEntity.h"

static NSString *const CreatureEntityDefaultIdentifier = @"ididid";

@implementation CreatureEntity

- (instancetype)initWithIdentifier:(NSString *)identifier {
    self = [super init];
    if (self) {
        _identifier = [identifier copy] ?: CreatureEntityDefaultIdentifier;
    }
    return self;
}

@end
