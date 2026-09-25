#import "HitPoints.h"

@implementation HitPoints

- (instancetype)initWithCurrent:(NSInteger)current max:(NSInteger)max temporary:(NSInteger)temporary {
    self = [super init];
    if (self) {
        _current = MIN(current, MAX_HIT_POINTS);
        _max = MIN(max, MAX_HIT_POINTS);
        _temporary = temporary;
    }
    return self;
}

+ (instancetype)hitPointsWithMax:(NSInteger)max {
    return [[HitPoints alloc] initWithCurrent:max max:max temporary:0];
}

- (void)loseHitPoints:(NSInteger)damage {
    self.current = MAX(0, self.current - damage);
}

@end
