#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface Creature : NSObject

@property (nonatomic, copy) NSString *identifier;
@property (nonatomic, assign) NSInteger hitPoints;
@property (nonatomic, copy) NSString *stable;

@end

typedef Creature CreatureDTO;

NS_ASSUME_NONNULL_END
