import {ClassProvider, inject, Injectable, Injector, runInInjectionContext} from '@angular/core';
import {HttpInterceptor, HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpRequest, HttpHandlerFn} from '@angular/common/http';
import {IGNORED_INTERCEPTORS} from '@anglr/common';
import {isBlank} from '@jscrpt/common';
import {Observable, ObservableInput} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

import {AuthInterceptorOptions} from './authInterceptor.options';
import {AuthenticationService} from '../../services';
import {AuthInterceptorData} from './authInterceptorData';

/**
 * Auth interceptor used for intercepting http responses and handling 401, 403 statuses
 * @param req - Request to be intercepted
 * @param next - Next function for passing request to next interceptor
 */
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>>
{
    const data = inject(AuthInterceptorData);
    const authSvc = inject(AuthenticationService);
    let options = inject(AuthInterceptorOptions, {optional: true});

    if(isBlank(options) || !(options instanceof AuthInterceptorOptions))
    {
        options = new AuthInterceptorOptions();
    }

    data.requestsInProgress++;

    return next(req)
        .pipe(catchError(err =>
        {
            return new Observable(observer =>
            {
                //client error, not response from server, or is ignored
                if (err.error instanceof Error || 
                    req.context.get(IGNORED_INTERCEPTORS).some(itm => itm == AuthInterceptor || itm == authInterceptor))
                {
                    observer.error(err);
                    observer.complete();

                    return;
                }

                //if auth error
                if(err.status == 403 || err.status == 401)
                {
                    if(data.blocked)
                    {
                        observer.error(err);
                        observer.complete();

                        return;
                    }

                    data.setBlocked();

                    //auth error from auth page are ignored
                    if(authSvc.isAuthPage())
                    {
                        observer.error(err);
                        observer.complete();

                        return;
                    }

                    //auth error from other pages
                    authSvc.getUserIdentity(true)
                        .then(async ({isAuthenticated}) =>
                        {
                            //access denied user authenticated, not authorized
                            if((isAuthenticated && options.treatUnauthorizedAsForbidden) ||
                            (isAuthenticated && !options.treatUnauthorizedAsForbidden && err.status == 403))
                            {
                                await authSvc.showAccessDenied();

                                observer.complete();

                                return;
                            }

                            //show auth page, user not authenticated
                            await authSvc.showAuthPage();

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
        tap(
        {
            next: () => data.requestsInProgress--, 
            error: () => data.requestsInProgress--,
        }));
}

/**
 * AuthInterceptor used for intercepting http responses and handling 401, 403 statuses
 * @deprecated - Use new `authInterceptor` function instead
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor
{
    //######################### constructors #########################
    constructor(private _injector: Injector)
    {
    }

    //######################### public methods - implementation of HttpInterceptor #########################

    /**
     * Intercepts http request
     * @param req - Request to be intercepted
     * @param next - Next middleware that can be called for next processing
     */
    public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>>
    {
        return runInInjectionContext(this._injector, () => authInterceptor(req, next.handle.bind(next)));
    }
}

/**
 * Provider for proper use of AuthInterceptor, use this provider to inject this interceptor
 * @deprecated - Use new `authInterceptor` function instead
 */
export const AUTH_INTERCEPTOR_PROVIDER: ClassProvider =
{
    provide: HTTP_INTERCEPTORS,
    multi: true,
    useClass: AuthInterceptor
};