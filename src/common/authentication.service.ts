import {Injectable} from '@angular/core';
import {isArray} from '@jscrpt/common';
import {Observable, Subject, EMPTY} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {UserIdentity} from './userIdentity';
import {AuthenticationServiceOptions} from './authenticationServiceOptions.interface';
import {AccessToken} from './accessToken';

/**
 * Authentication service managing authentication
 */
@Injectable({providedIn: 'root'})
export class AuthenticationService<TUserInfo = unknown>
{
    //######################### private fields #########################

    /**
     * Authentication promise that was used for authentication
     */
    private _authenticationPromise: Promise<UserIdentity<TUserInfo>>|null = null;

    /**
     * Resolved function for isInitialized
     */
    private _isInitializedResolver: (indication: boolean) => void = () => {};

    /**
     * Subject used for indicating authenticationChanged
     */
    private _authenticationChangedSubject: Subject<UserIdentity<TUserInfo>> = new Subject<UserIdentity<TUserInfo>>();

    /**
     * Last value of obtained user identity
     */
    private _userIdentity: UserIdentity<TUserInfo>|null = null;

    //######################### public properties #########################

    /**
     * Indication whether is authentication module initialized or not
     */
    public isInitialized: Promise<boolean>;

    /**
     * Gets observable that indicates when authentication has changed
     */
    public get authenticationChanged(): Observable<UserIdentity<TUserInfo>>
    {
        return this._authenticationChangedSubject.asObservable();
    }

    /**
     * Gets last value of obtained user identity, recomended to use only after authenticationChanged was emitted
     */
    public get userIdentity(): UserIdentity<TUserInfo>|null
    {
        return this._userIdentity;
    }

    //######################### constructor #########################
    constructor(private _options: AuthenticationServiceOptions<TUserInfo>)
    {
        this.isInitialized = new Promise(resolve => this._isInitializedResolver = resolve);
    }

    //######################### public methods #########################

    /**
     * Tests whether is used authorized for specified permission
     * @param permission - Permission name that is tested
     * @returns Promise<boolean> True if user is authorized otherwise false
     */
    public isAuthorizedSync(permission: string): boolean
    {
        if(this._userIdentity && isArray(this._userIdentity.permissions))
        {
            return this._userIdentity.permissions.indexOf(permission) > -1;
        }

        return false;
    }

    /**
     * Tests whether is used authorized for specified permission
     * @param permission - Permission name that is tested
     * @returns Promise<boolean> True if user is authorized otherwise false
     */
    public isAuthorized(permission: string): Promise<boolean>
    {
        return new Promise((resolve, reject) =>
        {
            this.getUserIdentity()
                .then((userIdentity: UserIdentity<TUserInfo>) =>
                {
                    if(isArray(userIdentity.permissions))
                    {
                        if(userIdentity.permissions.indexOf(permission) > -1)
                        {
                            resolve(true);
                        }
                        else
                        {
                            resolve(false);
                        }
                    }
                    else
                    {
                        resolve(false);
                    }
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Gets user identity
     * @param refresh - Indication that server get user identity should be called, otherwise cached response will be used
     */
    public getUserIdentity(refresh?: boolean): Promise<UserIdentity<TUserInfo>>
    {
        if(refresh === true)
        {
            this._authenticationPromise = null;
        }

        if(this._authenticationPromise != null)
        {
            return this._authenticationPromise;
        }

        this._authenticationPromise = new Promise((success, reject) =>
        {
            this._options
                .getUserIdentity()
                .pipe(catchError(error =>
                      {
                          this._userIdentity = null;
                          reject(error);
                          this._isInitializedResolver(true);

                          return EMPTY;
                      }))
                .subscribe((itm: UserIdentity<TUserInfo>) =>
                {
                    this._userIdentity = itm;
                    success(itm);
                    this._authenticationChangedSubject.next(itm);
                    this._isInitializedResolver(true);
                });
        });

        return this._authenticationPromise;
    }

    /**
     * Method logs user into system
     * @param accessToken - Access token holding authentication information
     * @returns Observable
     */
    public login(accessToken: AccessToken): Observable<UserIdentity>
    {
        return new Observable(observer =>
        {
            this._options.login(accessToken)
                .subscribe(() =>
                {
                    this.getUserIdentity(true)
                        .then(identity =>
                        {
                            observer.next(identity);
                            observer.complete();
                        });
                }, error =>
                {
                    observer.error(error);
                    observer.complete();
                });
        });
    }

    /**
     * Methods logs out user out of system
     * @returns Observable
     */
    public logout(): Observable<void>
    {
        return new Observable(observer =>
        {
            this._options.logout()
                .subscribe(() =>
                {
                    this.getUserIdentity(true)
                        .then(() =>
                        {
                            observer.next();
                            observer.complete();
                        });
                }, error =>
                {
                    observer.error(error);
                    observer.complete();
                });
        });
    }

    /**
     * Redirects current page to authentication page
     */
    public showAuthPage(): Promise<boolean>
    {
        return this._options.showAuthPage();
    }

    /**
     * Redirects current page to access denied page
     */
    public showAccessDenied(): Promise<boolean>
    {
        return this._options.showAccessDenied();
    }

    /**
     * Gets indication whether current state of app is displaying auth page or provided path is checked
     * @param path - Path to be tested whether is auth page, if not set, current page is checked
     */
    public isAuthPage(path?: string): boolean
    {
        return this._options.isAuthPage(path);
    }
}