#include "Vault.hpp"

namespace bank {
class Thief {
public:
    int steal(Vault& vault) { return vault.gold; }
};
}
