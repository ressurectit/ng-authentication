import {ClassProvider, Injectable, Optional} from '@angular/core';
import {HttpInterceptor, HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import {IGNORED_INTERCEPTORS} from '@anglr/common';
import {isBlank} from '@jscrpt/common';
import {Observable, ObservableInput} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

import {AuthInterceptorOptions} from './authInterceptor.options';
import {AuthenticationService} from '../../services';

/**
 * AuthInterceptor used for intercepting http responses and handling 401, 403 statuses
 */
@Injectable()
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
    constructor(private _authSvc: AuthenticationService,
                @Optional() private _options: AuthInterceptorOptions)
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
    public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>>
    {
        this.requestsInProgress++;

        return next.handle(req).pipe(catchError((err) =>
        {
            return new Observable(observer =>
            {
                //client error, not response from server, or is ignored
                if (err.error instanceof Error || 
                    req.context.get(IGNORED_INTERCEPTORS).some(itm => itm == AuthInterceptor))
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
            }) as ObservableInput<HttpEvent<unknown>>;
        }),
        tap(() => this.requestsInProgress--, () => this.requestsInProgress--));
    }
}

/**
 * Provider for proper use of AuthInterceptor, use this provider to inject this interceptor
 */
export const AUTH_INTERCEPTOR_PROVIDER: ClassProvider =
{
    provide: HTTP_INTERCEPTORS,
    multi: true,
    useClass: AuthInterceptor
};