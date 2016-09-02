/**
 * Extended type with authorization permission definition
 */
export interface AuthorizationDecoratedComponent
{
    /**
     * Name of permission required for authorization
     */
    permissionName: string;
}

/**
 * Used for setting required permission name for authentication
 * @param  {string} permission Name of requested permission, that is used for displaying of component
 * @returns ClassDecorator
 */
export function Authorize(permission: string): ClassDecorator
{
    return function <TFunction extends AuthorizationDecoratedComponent> (target: TFunction): TFunction
    {
        target.permissionName = permission;

        return target;
    };
}