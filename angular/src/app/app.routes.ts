import { Route } from '@angular/router';
import { ApolloSandboxComponent } from './apollo-sandbox/apollo-sandbox.component';
export const APP_ROUTES: Route[] = [
  {
    path: '',
    component: ApolloSandboxComponent,
    pathMatch: 'full',
  },
];
