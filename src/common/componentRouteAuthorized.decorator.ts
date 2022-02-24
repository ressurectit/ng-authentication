import {ComponentRoute, ComponentRouteDefinition} from '@anglr/common/router';

import {AuthGuard} from './auth.guard';

/**
 * Defines route for component on which is this decorator applied, automatically adds `AuthGuard`
 * @param route - Definition of route
 */
export function ComponentRouteAuthorized(route: ComponentRouteDefinition): ClassDecorator
{
    route.canActivate ??= [];

    //adds auth guard if there is no one
    if(route.canActivate.indexOf(AuthGuard) < 0)
    {
        route.canActivate.push(AuthGuard);
    }

    return ComponentRoute(route);
}
