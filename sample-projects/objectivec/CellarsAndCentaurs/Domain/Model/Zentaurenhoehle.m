#import "Zentaurenhoehle.h"

@implementation Zentaurenhoehle

- (NSString *)beschreibung {
    return [NSString stringWithFormat:@"Größe der Höhle: %ld", (long)self.ruestungsklasse];
}

@end
