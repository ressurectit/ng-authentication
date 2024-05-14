import {Injector, inject} from '@angular/core';
import {ActivatedRouteSnapshot, Router, UrlTree, UrlSegmentGroup, CanActivateFn} from '@angular/router';
import {isBlank, flatMapArray} from '@jscrpt/common';

import type {AuthorizeOptions, AuthorizationDecoratedComponent} from '../decorators';
import {AuthenticationService} from '../services';
import {evaluatePermissions} from '../misc/utils';

/**
 * Routing guard that is used for authorization of user
 * @param route - Information about next coming route
 */
export async function authGuard(route: ActivatedRouteSnapshot): Promise<boolean>
{
    const authSvc = inject(AuthenticationService);
    const injector = inject(Injector);
    const router = inject(Router);

    const component = route.component as unknown as AuthorizationDecoratedComponent;
    let authOptions: AuthorizeOptions|undefined;

    //route specific auth options
    if(route.routeConfig?.path &&
       component.routeSpecificPermissions?.[route.routeConfig.path])
    {
        authOptions = component.routeSpecificPermissions[route.routeConfig.path];
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
        addCondition = await authOptions.addCondition(injector);
    }

    const userIdentity = authSvc.userIdentity;

    if(isBlank(userIdentity))
    {
        throw new Error('AuthenticationService must be initialized before first use of AuthGuard');
    }

    const authorized = evaluatePermissions(userIdentity.permissions,
                                           authOptions.permission,
                                           authOptions.andCondition ?? false,
                                           authOptions.conditionString ?? false,
                                           addCondition);

    const urlSegmentGroup = new UrlSegmentGroup(flatMapArray(route.pathFromRoot.map(itm => itm.url)), {});
    const urlTree = new UrlTree();
    urlTree.root = urlSegmentGroup;
    urlTree.queryParams = {};
    const nextPath = router.serializeUrl(urlTree);

    //user is authenticated and not authorized
    if(!authorized && userIdentity.isAuthenticated)
    {
        authSvc.showAccessDenied();

        return false;
    }
    //not authorized, not authenticated, not on login page
    else if(!authorized && !userIdentity.isAuthenticated && !authSvc.isAuthPage(nextPath))
    {
        authSvc.showAuthPage();
        
        return false;
    }

    return true;
}

//TODO: remove

/**
 * Routing guard that is used for authorization of user
 * 
 * @deprecated use `authGuard` instead, will be removed in future
 */
export const AuthGuard: CanActivateFn = authGuard;
