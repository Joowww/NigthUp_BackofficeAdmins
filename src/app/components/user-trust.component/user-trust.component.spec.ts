import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTrustComponent } from './user-trust.component';

describe('UserTrustComponent', () => {
  let component: UserTrustComponent;
  let fixture: ComponentFixture<UserTrustComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTrustComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTrustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
