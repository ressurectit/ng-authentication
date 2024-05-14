import {Component, ChangeDetectionStrategy} from '@angular/core';
import {ComponentRoute, ComponentRedirectRoute} from '@anglr/common/router';
import {Authorize, authGuard} from '@anglr/authentication';

/**
 * Home component
 */
@Component(
{
    selector: 'home-view',
    templateUrl: 'home.component.html',
    standalone: true,
    imports:
    [
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentRedirectRoute('', 'home')
@ComponentRoute({path: 'home', canActivate: [authGuard]})
@Authorize('home-page')
export class HomeComponent
{
}
