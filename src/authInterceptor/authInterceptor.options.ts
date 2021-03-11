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

    /**
     * Indication whether after 401/403 authInterceptor can use cached user identity or make new call to server
     */
    public useCachedUserIdentity: boolean = false;

    //######################### constructor #########################

    /**
     * Creates instance of AuthInterceptorOptions
     * @param treatForbiddenAndUnauthorizedAsSame - Indication whether treat forbidden (403) and unauthorized (401) as same error
     * @param useCachedUserIdentityAsSame - Indication whether after 401/403 authInterceptor can use cached user identity or make new call to server
     */
    constructor(
        treatForbiddenAndUnauthorizedAsSame?: boolean,
        useCachedUserIdentityAsSame?: boolean,
        )
    {
        if(isPresent(treatForbiddenAndUnauthorizedAsSame))
        {
            this.treatUnauthorizedAsForbidden = treatForbiddenAndUnauthorizedAsSame;
        }
        if(isPresent(useCachedUserIdentityAsSame))
        {
            this.useCachedUserIdentity = useCachedUserIdentityAsSame;
        }
    }
}
