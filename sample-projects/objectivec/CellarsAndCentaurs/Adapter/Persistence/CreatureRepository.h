#import <Foundation/Foundation.h>
#import "Repository.h"
#import "CreatureEntity.h"

NS_ASSUME_NONNULL_BEGIN

@interface CreatureRepository : Repository<CreatureEntity *>

- (void)saveEntity:(CreatureEntity *)entity;

@end

NS_ASSUME_NONNULL_END
