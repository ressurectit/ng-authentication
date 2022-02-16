import {AuthenticationService} from '../common/authentication.service';

/**
 * Gets indication whether user is authorized
 * @param authSvc - Instance of Authentication service
 * @param condition - Condition to be checked against users permissions
 * @param andCondition - Indication that AND condition should be used isntead of OR condition if multiple permissions are provided
 * @param conditionString - Indication that provided string is set of loggical operations among permission names, if this is true andCondition is ignored
 * @param addCondition - Additional condition that is added to evaluation of permission
 */
export function isAuthorized(authSvc: AuthenticationService,
                             condition: string|string[],
                             andCondition: boolean = false,
                             conditionString: boolean = false,
                             addCondition: boolean = true): boolean
{
    return evaluatePermissions(authSvc.userIdentity.permissions,
                               condition,
                               andCondition,
                               conditionString,
                               addCondition);
}

/**
 * Evaluates permissions and conditions and returns result
 * @param permissions - Array of user permissions to be checked
 * @param condition - Condition to be checked against users permissions
 * @param andCondition - Indication that AND condition should be used isntead of OR condition if multiple permissions are provided
 * @param conditionString - Indication that provided string is set of loggical operations among permission names, if this is true andCondition is ignored
 * @param addCondition - Additional condition that is added to evaluation of permission
 */
export function evaluatePermissions(permissions: string[],
                                    condition: string|string[],
                                    andCondition: boolean = false,
                                    conditionString: boolean = false,
                                    addCondition: boolean = true): boolean
{
    //Multiple conditions
    if(Array.isArray(condition))
    {
        const arrayPermission: string[] = condition;

        if(andCondition)
        {
            //AND Condition
            if(arrayPermission.map(perm => permissions.indexOf(perm) > -1).every(itm => itm === true))
            {
                return true && addCondition;
            }
        }
        else
        {
            //OR Condition
            if(arrayPermission.map(perm => permissions.indexOf(perm) > -1).indexOf(true) > -1)
            {
                return true && addCondition;
            }
        }
    }
    //Single condition
    else
    {
        //Condition string
        if(conditionString)
        {
            //TODO - think of some optimization for performance reasons
            let cond: string = condition;
            cond.replace(/!?(.*?)(?:&+|\|+|\(|\)|$)/g, '$1')
                .split(' ')
                .filter(itm => itm.trim())
                .forEach(permissionName => cond = cond.replace(new RegExp(permissionName, 'g'), (permissions.indexOf(permissionName) > -1).toString()));

            if(new Function(`return (${cond})`)())
            {
                return true && addCondition;
            }
        }
        //Permission name string
        else
        {
            const stringPermission: string = <string>condition;

            if(permissions.indexOf(stringPermission) > -1)
            {
                return true && addCondition;
            }
        }
    }

    return false;
}