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
 * @param permission - Name of requested permission, that is used for displaying of component
 * @returns ClassDecorator
 */
export function Authorize(permission: string)
{
    return function <TFunction extends Function> (target: TFunction): TFunction
    {
        const typedTarget = target as unknown as AuthorizationDecoratedComponent;
        typedTarget.permissionName = permission;

        return target;
    };
}