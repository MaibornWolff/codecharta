#import "Speed.h"

@implementation Speed

- (instancetype)initWithFeetPerRound:(NSInteger)feetPerRound {
    self = [super init];
    if (self) {
        _feetPerRound = feetPerRound;
    }
    return self;
}

+ (instancetype)speedWithFeetPerRound:(NSInteger)feetPerRound {
    return [[Speed alloc] initWithFeetPerRound:feetPerRound];
}

@end
