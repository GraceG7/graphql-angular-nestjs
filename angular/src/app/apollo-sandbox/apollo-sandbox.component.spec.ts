import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApolloSandboxComponent } from './apollo-sandbox.component';

describe('ApolloSandboxComponent', () => {
  let component: ApolloSandboxComponent;
  let fixture: ComponentFixture<ApolloSandboxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloSandboxComponent]
    });
    fixture = TestBed.createComponent(ApolloSandboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
