import {Observable} from 'rxjs';

import {UserIdentity} from './userIdentity';
import {AccessToken} from './accessToken';

/**
 * Options for authentication service
 */
export abstract class AuthenticationServiceOptions<TUserInfo = unknown>
{
    //######################### public methods #########################

    /**
     * Method logs user into system
     * @param accessToken - Access token holding authentication information
     */
    public abstract login(accessToken: AccessToken): Observable<void>;
    
    /**
     * Gets indication whether current state of app is displaying auth page or provided path is checked
     * @param path - Path to be tested whether is auth page, if not set, current page is checked
     */
    public abstract isAuthPage(path?: string): boolean;

    /**
     * Methods logs out user out of system
     */
    public abstract logout(): Observable<void>;

    /**
     * Gets information about user
     */
    public abstract getUserIdentity(): Observable<UserIdentity<TUserInfo>>;

    /**
     * Redirects current page to authentication page
     */
    public abstract showAuthPage(): Promise<boolean>;

    /**
     * Redirects current page to access denied page
     */
    public abstract showAccessDenied(): Promise<boolean>;
}
