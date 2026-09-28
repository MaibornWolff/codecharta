#import "Repository.h"

@interface Repository ()

@property (nonatomic, strong) NSMutableDictionary<NSString *, id> *storage;

@end

@implementation Repository

- (instancetype)init {
    self = [super init];
    if (self) {
        _storage = [NSMutableDictionary dictionary];
    }
    return self;
}

- (void)save:(id)object withIdentifier:(NSString *)identifier {
    self.storage[identifier] = object;
}

- (id)findOne:(NSString *)identifier {
    return self.storage[identifier];
}

- (NSArray *)findAll {
    return self.storage.allValues;
}

@end
