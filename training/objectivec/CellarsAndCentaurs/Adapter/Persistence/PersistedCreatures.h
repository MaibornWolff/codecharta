#import <Foundation/Foundation.h>
#import "Creatures.h"

@class CreatureRepository;

NS_ASSUME_NONNULL_BEGIN

@interface PersistedCreatures : NSObject <Creatures>

- (instancetype)initWithRepository:(CreatureRepository *)repository NS_DESIGNATED_INITIALIZER;

@end

NS_ASSUME_NONNULL_END
