#import "CreatureClassifier.h"

@implementation CreatureClassifier

+ (BOOL)isCentaur:(Creature *)creature {
    return [creature isKindOfClass:[Centaur class]];
}

+ (NSString *)kindOf:(Creature *)creature {
    if ([self isCentaur:creature]) {
        return NSStringFromClass([Centaur class]);
    }
    return NSStringFromClass([creature class]);
}

@end
