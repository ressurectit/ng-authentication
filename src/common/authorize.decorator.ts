import {Injector} from '@angular/core';
import {Dictionary, isBlank, isString, PromiseOr} from '@jscrpt/common';

/**
 * Extended type with authorization permission definition
 */
export interface AuthorizationDecoratedComponent
{
    /**
     * Definition of permissions required for authorization for all routes
     */
    permissions?: AuthorizeOptions;

    /**
     * Route specific permissions, can be applied only for specific route, overrides `permissions`
     */
    routeSpecificPermissions?: Dictionary<AuthorizeOptions>;
}

/**
 * Options passed to `Authorize` decorator
 */
export interface AuthorizeOptions
{
    /**
     * Name of permission or array of permissions that is requested for displaying component
     */
    permission: string|string[];

    /**
     * Indication that AND condition should be used instead of OR condition if multiple permissions are provided
     */
    andCondition?: boolean;

    /**
     * Indication that provided string is set of loggical operations among permission names, if this is true andCondition is ignored
     */
    conditionString?: boolean;

    /**
     * Callback for additional condition that is added to evaluation of permission
     */
    addCondition?: (injector: Injector) => PromiseOr<boolean>;
}

/**
 * Used for setting required permission name for authentication
 * @param permission - Name of requested permission, array of permission names or AuthorizeOptions that is used for displaying of component
 * @param route - If provided route specific permission will be created applied only to specified route
 */
export function Authorize(permission: string|string[]|AuthorizeOptions, route?: string)
{
    return function <TFunction extends Function> (target: TFunction): TFunction
    {
        let options: AuthorizeOptions;

        if(isString(permission) || Array.isArray(permission))
        {
            options =
            {
                permission
            };
        }
        else
        {
            options = permission;
        }

        const typedTarget = target as unknown as AuthorizationDecoratedComponent;

        if(isBlank(route))
        {
            typedTarget.permissions = options;
        }
        else
        {
            typedTarget.routeSpecificPermissions ??= {};
            typedTarget.routeSpecificPermissions[route] = options;
        }

        return target;
    };
}