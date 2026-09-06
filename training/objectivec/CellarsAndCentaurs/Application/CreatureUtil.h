#import <Foundation/Foundation.h>
#import "Creature.h"

NS_ASSUME_NONNULL_BEGIN

@interface CreatureUtil : NSObject

@property (class, nonatomic, readonly) NSString *standardArmorClassDescription;

+ (NSUInteger)treasureHoardOf:(Creature *)creature;

@end

@interface Creature (Treasure)

- (NSUInteger)treasureHoardValue;

@end

NS_ASSUME_NONNULL_END
