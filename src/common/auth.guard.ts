import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot} from '@angular/router';
import {Observable, Observer} from 'rxjs';

import {AuthenticationService} from './authentication.service';
import {AuthorizationDecoratedComponent} from './authorize.decorator';

/**
 * Routing guard that is used for authorization of user
 */
@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate
{
    //######################### constructor #########################
    constructor(private authService: AuthenticationService<any>)
    {
    }

    //######################### implementation of CanActivate #########################

    /**
     * Tests whether component can be activated
     * @param next - Information about next coming route
     * @param state - Information about router state
     * @returns Observable
     */
    canActivate(next: ActivatedRouteSnapshot) : Observable<boolean>
    {
        const component: AuthorizationDecoratedComponent = <any>next.component;
        const permission: string = component.permissionName;

        return Observable.create((observer: Observer<boolean>) =>
        {
            this.authService
                .getUserIdentity()
                .catch(() =>
                {
                    console.error('Unexpected error in AuthGuard!');
                    observer.next(false);
                    observer.complete();
                        
                    return;
                })
                .then(userData =>
                {
                    if(userData)
                    {
                        if(userData.permissions.indexOf(permission) < 0 && userData.isAuthenticated)
                        {
                            this.authService.showAccessDenied();
                            observer.next(false);
                            observer.complete();
                        
                            return;
                        }
                        else if(userData.permissions.indexOf(permission) < 0 && !userData.isAuthenticated && !this.authService.isAuthPage())
                        {
                            this.authService.showAuthPage();
                            observer.next(false);
                            observer.complete();
                            
                            return;
                        }

                        observer.next(true);
                        observer.complete();

                        return;
                    }

                    console.warn('No UserData in AuthGuard!');
                    observer.next(false);
                    observer.complete();
                });
        });
    }
}