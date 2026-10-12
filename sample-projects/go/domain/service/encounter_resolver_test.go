package service

import (
	"fmt"
	"testing"

	"de.sots/cellarsandcentaurs/domain/model"
)

func TestResolve_should_miss_on_a_natural_one(t *testing.T) {
	terrains := []string{"cellar", "dungeon", "lair"}
	for _, terrain := range terrains {
		t.Run(terrain, func(t *testing.T) {
			resolver := &EncounterResolver{}
			if resolver.Resolve(nil, nil, 1, 0, terrain) != 0 {
				t.Errorf("a natural one must miss in the %s", terrain)
			}
		})
	}
}

func BenchmarkSafeRoll(b *testing.B) {
	resolver := &EncounterResolver{}
	for index := 0; index < b.N; index++ {
		resolver.SafeRoll(model.Dice{Sides: 20})
	}
}

func FuzzSafeRoll(f *testing.F) {
	f.Fuzz(func(t *testing.T, sides int) {
		if sides < 1 {
			t.Skip()
		}
	})
}

func ExampleEncounterResolver_IsEmpty() {
	fmt.Println((&EncounterResolver{}).IsEmpty())
	// Output: true
}
