#import <Foundation/Foundation.h>
#import "CreatureType.h"

@class CreatureService;
@class Creature;
@class Speed;
@class ArmorClass;

NS_ASSUME_NONNULL_BEGIN

@interface CreatureFacade : NSObject

@property (class, nonatomic, readonly) CreatureType standardCreatureType;

- (instancetype)initWithCreatureService:(CreatureService *)creatureService NS_DESIGNATED_INITIALIZER;

- (Creature *)createWithType:(CreatureType)type
                walkingSpeed:(Speed *)walkingSpeed
                 flyingSpeed:(Speed *)flyingSpeed
               swimmingSpeed:(Speed *)swimmingSpeed
              burrowingSpeed:(Speed *)burrowingSpeed
               climbingSpeed:(Speed *)climbingSpeed
                  armorClass:(ArmorClass *)armorClass
                   hitPoints:(NSInteger)hitPointsValue;

@end

NS_ASSUME_NONNULL_END
