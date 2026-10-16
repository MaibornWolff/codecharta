import { TestBed } from '@angular/core/testing';
import { CreatureListComponent } from './creature-list.component';

describe('CreatureListComponent', () => {
  it('should_save_creature_to_the_stable', () => {
    const fixture = TestBed.createComponent(CreatureListComponent);
    const walking_speed = 30;

    fixture.componentInstance.creatures = [];
    fixture.detectChanges();

    expect(walking_speed).toBe(30);
  });
});
