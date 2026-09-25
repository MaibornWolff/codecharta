#import <Foundation/Foundation.h>
#import "Fightable.h"
#import "CreatureType.h"
#import "SpeedType.h"

@class CreatureId;
@class ArmorClass;
@class HitPoints;
@class Speed;

NS_ASSUME_NONNULL_BEGIN

/**
 * A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
 */
@interface Creature : NSObject <Fightable>

@property (nonatomic, copy) CreatureId *creatureId;
@property (nonatomic, assign) CreatureType type;
@property (nonatomic, strong, nullable) ArmorClass *armorClass;
@property (nonatomic, strong, nullable) HitPoints *hitPoints;
@property (nonatomic, copy) NSDictionary<NSNumber *, Speed *> *speeds;

- (instancetype)initWithId:(CreatureId *)creatureId;
- (instancetype)initWithId:(CreatureId *)creatureId type:(CreatureType)type NS_DESIGNATED_INITIALIZER;
- (nullable Speed *)speedOfType:(SpeedType)speedType;

@end

NS_ASSUME_NONNULL_END
