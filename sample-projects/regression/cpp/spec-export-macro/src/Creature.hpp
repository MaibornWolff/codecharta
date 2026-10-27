#include "Export.hpp"
#include "Dice.hpp"

namespace game {
class GAME_EXPORT Creature { public: Dice dice; };
struct GAME_EXPORT GAME_DEPRECATED Centaur final : public Creature { Dice bow; };
}
