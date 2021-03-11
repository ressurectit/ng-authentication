import {Injectable, Inject, Injector} from '@angular/core';
import {isFunction, isArray, isBlank} from '@jscrpt/common';
import {Observable, Observer, Subject, EMPTY} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {UserIdentity} from './userIdentity';
import {AuthenticationServiceOptions, AUTHENTICATION_SERVICE_OPTIONS} from './authenticationServiceOptions.interface';
import {AccessToken} from './accessToken';

/**
 * Factory used for creating AuthenticationService
 * @param options - Options passed to created service
 */
export function authenticationServiceFactory(options: AuthenticationServiceOptions<any>)
{
    if(isBlank(options) ||
       isBlank(options.getUserIdentity) || !isFunction(options.getUserIdentity) ||
       isBlank(options.login) || !isFunction(options.login) ||
       isBlank(options.logout) || !isFunction(options.logout) ||
       isBlank(options.isAuthPage) || !isFunction(options.isAuthPage) ||
       isBlank(options.showAccessDenied) || !isFunction(options.showAccessDenied) ||
       isBlank(options.showAuthPage) || !isFunction(options.showAuthPage))
    {
        throw new Error("Options must be set and must implement AuthenticationServiceOptions");
    }

    return new AuthenticationService(options);
}

/**
 * Authentication service managing authentication
 */
@Injectable({providedIn: 'root', deps: [AUTHENTICATION_SERVICE_OPTIONS], useFactory: authenticationServiceFactory})
export class AuthenticationService<TUserInfo = any>
{
    //######################### private fields #########################

    /**
     * Authentication promise that was used for authentication
     */
    private _authenticationPromise: Promise<UserIdentity<TUserInfo>>|null;

    /**
     * Resolved function for isInitialized
     */
    private _isInitializedResolver: (indication: boolean) => void;

    /**
     * Subject used for indicating authenticationChanged
     */
    private _authenticationChangedSubject: Subject<UserIdentity<TUserInfo>> = new Subject<UserIdentity<TUserInfo>>();

    /**
     * Last value of obtained user identity
     */
    private _userIdentity: UserIdentity<TUserInfo>;

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
    public get userIdentity(): UserIdentity<TUserInfo>
    {
        return this._userIdentity;
    }

    //######################### constructor #########################
    //TODO - report bug, this is HACK to be compilable, check if it works when library will be compiled for IVY
    constructor(@Inject(Injector) private _options: AuthenticationServiceOptions<TUserInfo>)
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
        if(isArray(this._userIdentity?.permissions))
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
     * @returns Promise
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
    public login(accessToken: AccessToken): Observable<any>
    {
        return Observable.create((observer: Observer<any>) =>
        {
            this._options.login(accessToken)
                .subscribe(() =>
                {
                    this.getUserIdentity(true)
                        .then(() =>
                        {
                            observer.next(null);
                        });
                }, error =>
                {
                    observer.error(error);
                });
        });
    }

    /**
     * Methods logs out user out of system
     * @returns Observable
     */
    public logout(): Observable<any>
    {
        return Observable.create((observer: Observer<any>) =>
        {
            this._options.logout()
                .subscribe(() =>
                {
                    this.getUserIdentity(true)
                        .then(() =>
                        {
                            observer.next(null);
                        });
                }, error =>
                {
                    observer.error(error);
                });
        });
    }

    /**
     * Redirects current page to authentication page
     */
    public showAuthPage(status?: number, statusText?: string, detail?: any): Promise<boolean>
    {
        return this._options.showAuthPage(status, statusText, detail);
    }

    /**
     * Redirects current page to access denied page
     */
    public showAccessDenied(status?: number, statusText?: string, detail?: any): Promise<boolean>
    {
        return this._options.showAccessDenied(status, statusText, detail);
    }

    /**
     * Gets indicatio whether current state of app is displaying login page
     * @returns boolean
     */
    public isAuthPage(): boolean
    {
        return this._options.isAuthPage();
    }
}
