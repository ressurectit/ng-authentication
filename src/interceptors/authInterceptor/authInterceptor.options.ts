import {isPresent} from '@jscrpt/common';

/**
 * Options that are used within AuthInterceptor
 */
export class AuthInterceptorOptions
{
    //######################### public properties #########################

    /**
     * Indication whether treat unauthorized (401) as forbidden (403) http error for 'authorized'
     */
    public treatUnauthorizedAsForbidden: boolean = false;

    //######################### constructor #########################

    /**
     * Creates instance of AuthInterceptorOptions
     * @param treatForbiddenAndUnauthorizedAsSame - Indication whether treat forbidden (403) and unauthorized (401) as same error
     */
    constructor(treatForbiddenAndUnauthorizedAsSame?: boolean)
    {
        if(isPresent(treatForbiddenAndUnauthorizedAsSame))
        {
            this.treatUnauthorizedAsForbidden = treatForbiddenAndUnauthorizedAsSame;
        }
    }
}