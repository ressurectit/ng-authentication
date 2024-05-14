import {Pipe, PipeTransform} from '@angular/core';

import {AuthenticationService} from '../../services';
import {isAuthorized} from '../../misc/utils';

/**
 * Tests whether user has permission
 */
@Pipe({name: 'hasPermission', standalone: true})
export class HasPermissionPipe implements PipeTransform
{
    //######################### constructor #########################
    constructor(protected _authSvc: AuthenticationService)
    {
    }

    //######################### public methods - implementation of PipeTransform #########################

    /**
     * Tests whether user has permission
     * @param condition - Condition to be checked against users permissions
     * @param andCondition - Indication that AND condition should be used isntead of OR condition if multiple permissions are provided
     * @param conditionString - Indication that provided string is set of loggical operations among permission names, if this is true andCondition is ignored
     * @param addCondition - Additional condition that is added to evaluation of permission
     */
    public transform(condition: string|string[],
                     andCondition: boolean = false,
                     conditionString: boolean = false,
                     addCondition: boolean = true,): boolean
    {
        return isAuthorized(this._authSvc, condition, andCondition, conditionString, addCondition);
    }
}
