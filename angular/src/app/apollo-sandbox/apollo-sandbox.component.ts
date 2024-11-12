import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApolloSandbox } from '@apollo/sandbox';
import { AuthService } from '@auth0/auth0-angular';
import { RxEffects } from '@rx-angular/state/effects';
import { switchMap, take } from 'rxjs';

@Component({
  selector: 'app-apollo-sandbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './apollo-sandbox.component.html',
  styleUrls: ['./apollo-sandbox.component.scss'],
  providers: [RxEffects],
})
export class ApolloSandboxComponent {
  @ViewChild('embeddedsandbox', { static: false })
  sandboxElementRef: ElementRef | null = null;
  constructor(private authService: AuthService, private effects: RxEffects) {}
  ngAfterViewInit() {
    if (this.sandboxElementRef) {
      this.effects.register(
        this.authService.loginWithPopup().pipe(
          switchMap(() => {
            return this.authService.getAccessTokenSilently().pipe(take(1));
          })
        ),
        (token: string) => {
          new ApolloSandbox({
            target: this.sandboxElementRef?.nativeElement,
            initialEndpoint: `http://localhost:3000/postgraphile/graphql`,
            initialSubscriptionEndpoint: `ws://localhost:3000/postgraphile/graphql`,
            endpointIsEditable: false,
            initialState: {
              pollForSchemaUpdates: false,
            },
            handleRequest: (endpointUrl, options) => {
              return fetch(endpointUrl, {
                ...options,
                headers: {
                  ...options.headers,
                  authorization: `Bearer ${token}`,
                },
              });
            },
          });
        }
      );
    }
  }
}
