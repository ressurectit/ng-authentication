import {ComponentRoute, ComponentRouteDefinition} from '@anglr/common/router';

import {authGuard} from '../guards';

/**
 * Defines route for component on which is this decorator applied, automatically adds `authGuard`
 * @param route - Definition of route
 */
export function ComponentRouteAuthorized(route: ComponentRouteDefinition): ClassDecorator
{
    route.canActivate ??= [];

    //adds auth guard if there is no one
    if(route.canActivate.indexOf(authGuard) < 0)
    {
        route.canActivate.push(authGuard);
    }

    return ComponentRoute(route);
}
