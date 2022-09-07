import {Injectable, Injector} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, Router, UrlTree, UrlSegmentGroup} from '@angular/router';
import {isBlank, flatMapArray} from '@jscrpt/common';

import {AuthorizeOptions} from './authorize.decorator';
import {AuthenticationService} from './authentication.service';
import {AuthorizationDecoratedComponent} from './authorize.decorator';
import {evaluatePermissions} from '../misc/utils';

/**
 * Routing guard that is used for authorization of user
 */
@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate
{
    //######################### constructor #########################
    constructor(private _authSvc: AuthenticationService,
                private _injector: Injector,
                private _router: Router)
    {
    }

    //######################### implementation of CanActivate #########################

    /**
     * Tests whether component can be activated
     * @param next - Information about next coming route
     */
    public async canActivate(next: ActivatedRouteSnapshot) : Promise<boolean>
    {
        const component = next.component as unknown as AuthorizationDecoratedComponent;
        let authOptions: AuthorizeOptions|undefined;

        //route specific auth options
        if(next.routeConfig?.path &&
           component.routeSpecificPermissions?.[next.routeConfig.path])
        {
            authOptions = component.routeSpecificPermissions[next.routeConfig.path];
        }
        //common auth options
        else if(component.permissions)
        {
            authOptions = component.permissions;
        }
        
        if(!authOptions)
        {
            return true;
        }

        let addCondition: boolean = true;

        //evaluate add condition
        if(authOptions.addCondition)
        {
            addCondition = await authOptions.addCondition(this._injector);
        }

        const userIdentity = this._authSvc.userIdentity;

        if(isBlank(userIdentity))
        {
            throw new Error('AuthenticationService must be initialized before first use of AuthGuard');
        }

        const authorized = evaluatePermissions(userIdentity.permissions,
                                               authOptions.permission,
                                               authOptions.andCondition ?? false,
                                               authOptions.conditionString ?? false,
                                               addCondition);

        const urlSegmentGroup = new UrlSegmentGroup(flatMapArray(next.pathFromRoot.map(itm => itm.url)), {});
        const urlTree = new UrlTree();
        urlTree.root = urlSegmentGroup;
        urlTree.queryParams = {};
        const nextPath = this._router.serializeUrl(urlTree);

        //user is authenticated and not authorized
        if(!authorized && userIdentity.isAuthenticated)
        {
            this._authSvc.showAccessDenied();

            return false;
        }
        //not authorized, not authenticated, not on login page
        else if(!authorized && !userIdentity.isAuthenticated && !this._authSvc.isAuthPage(nextPath))
        {
            this._authSvc.showAuthPage();
            
            return false;
        }

        return true;
    }
}