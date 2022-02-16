import {FactoryProvider, Injector} from '@angular/core';
import {HttpInterceptor, HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import {IgnoredInterceptorsService, AdditionalInfo, IgnoredInterceptorId} from '@anglr/common';
import {isBlank} from '@jscrpt/common';
import {Observable, ObservableInput, Observer} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

import {AuthInterceptorOptions} from './authInterceptor.options';
import {AuthenticationService} from '../common/authentication.service';

/**
 * AuthInterceptor used for intercepting http responses and handling 401, 403 statuses
 */
export class AuthInterceptor implements HttpInterceptor
{
    //######################### private fields #########################

    /**
     * Counter for requests in progress
     */
    private _requestsInProgress: number = 0;

    /**
     * Indication whether is handling of 401, 403 blocked because one request is already handled
     */
    private _blocked: boolean = false;

    //######################### private properties #########################

    /**
     * Counter for requests in progress
     */
    private get requestsInProgress(): number
    {
        return this._requestsInProgress;
    }
    private set requestsInProgress(value: number)
    {
        this._requestsInProgress = value;

        if(value < 1)
        {
            this._blocked = false;
            this._requestsInProgress = 0;
        }
    }

    //######################### constructors #########################
    constructor(private _authSvc: AuthenticationService<any>,
                private _ignoredInterceptorsService: IgnoredInterceptorsService,
                private _options: AuthInterceptorOptions)
    {
        if(isBlank(_options) || !(_options instanceof AuthInterceptorOptions))
        {
            this._options = new AuthInterceptorOptions();
        }
    }

    //######################### public methods - implementation of HttpInterceptor #########################

    /**
     * Intercepts http request
     * @param req - Request to be intercepted
     * @param next - Next middleware that can be called for next processing
     */
    public intercept(req: HttpRequest<any> & AdditionalInfo<IgnoredInterceptorId>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        this.requestsInProgress++;

        return next.handle(req).pipe(catchError((err) =>
        {
            return Observable.create((observer: Observer<any>) =>
            {
                //client error, not response from server, or is ignored
                if (err.error instanceof Error || 
                    (this._ignoredInterceptorsService && this._ignoredInterceptorsService.isIgnored(AuthInterceptor, req.additionalInfo)))
                {
                    observer.error(err);
                    observer.complete();

                    return;
                }

                //if auth error
                if(err.status == 403 || err.status == 401)
                {
                    if(this._blocked)
                    {
                        observer.error(err);
                        observer.complete();

                        return;
                    }

                    this._blocked = true;

                    //auth error from auth page are ignored
                    if(this._authSvc.isAuthPage())
                    {
                        observer.error(err);
                        observer.complete();

                        return;
                    }

                    //auth error from other pages
                    this._authSvc.getUserIdentity(true)
                        .then(async ({isAuthenticated}) =>
                        {
                            //access denied user authenticated, not authorized
                            if((isAuthenticated && this._options.treatUnauthorizedAsForbidden) ||
                               (isAuthenticated && !this._options.treatUnauthorizedAsForbidden && err.status == 403))
                            {
                                await this._authSvc.showAccessDenied();

                                observer.complete();

                                return;
                            }

                            //show auth page, user not authenticated
                            await this._authSvc.showAuthPage();

                            observer.complete();

                            return;
                        })
                        .catch(() => observer.complete());

                    return;
                }

                //other errors
                observer.error(err);
                observer.complete();
            }) as ObservableInput<HttpEvent<any>>;
        }),
        tap(() => this.requestsInProgress--, () => this.requestsInProgress--));
    }
}

/**
 * Factory used for creating auth interceptor
 * @param injector - Injector used for obtaining dependencies
 */
export function authInterceptorProviderFactory(injector: Injector)
{
    return new AuthInterceptor(injector.get(AuthenticationService), injector.get(IgnoredInterceptorsService), injector.get(AuthInterceptorOptions, null));
};

/**
 * Provider for proper use of AuthInterceptor, use this provider to inject this interceptor
 */
export const AUTH_INTERCEPTOR_PROVIDER: FactoryProvider =
{
    provide: HTTP_INTERCEPTORS,
    multi: true,
    useFactory: authInterceptorProviderFactory,
    deps: [Injector]
};