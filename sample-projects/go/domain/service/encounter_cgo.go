package service

/*
#include <stdlib.h>
// C comment inside the cgo preamble
static int roll_loaded_dice(int sides) {
	if (sides > 20 && sides < 100) {
		return 20;
	}
	return sides > 0 ? sides : 1;
}
*/
import "C"

func rollLoadedDice(sides int) int {
	return int(C.roll_loaded_dice(C.int(sides)))
}
