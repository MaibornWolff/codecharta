#import <Foundation/Foundation.h>
#import "EntityAlias.h"

NS_ASSUME_NONNULL_BEGIN

@interface EntityArchive : NSObject

@property (nonatomic, copy, readonly) NSArray<Entity *> *archivedEntities;

- (void)archiveEntity:(Entity *)entity;

@end

NS_ASSUME_NONNULL_END
