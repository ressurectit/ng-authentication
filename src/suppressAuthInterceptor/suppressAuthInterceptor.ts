import {ClassProvider, Injectable} from '@angular/core';
import {HttpInterceptor, HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import {IgnoredInterceptorsService, AdditionalInfo, IgnoredInterceptorId} from '@anglr/common';
import {Observable, ObservableInput, Observer} from 'rxjs';
import {catchError} from 'rxjs/operators';

/**
 * SuppressAuthInterceptor used for intercepting http responses and suppressing 401, 403 statuses
 */
@Injectable()
export class SuppressAuthInterceptor implements HttpInterceptor
{
    //######################### constructors #########################
    constructor(private _ignoredInterceptorsService: IgnoredInterceptorsService)
    {
    }

    //######################### public methods - implementation of HttpInterceptor #########################

    /**
     * Intercepts http request
     * @param req - Request to be intercepted
     * @param next - Next middleware that can be called for next processing
     */
    public intercept(req: HttpRequest<any> & AdditionalInfo<IgnoredInterceptorId>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        return next.handle(req).pipe(catchError((err) =>
        {
            return Observable.create((observer: Observer<any>) =>
            {
                //client error, not response from server, or is ignored
                if (err.error instanceof Error || 
                    (this._ignoredInterceptorsService && this._ignoredInterceptorsService.isIgnored(SuppressAuthInterceptor, req.additionalInfo)))
                {
                    observer.error(err);
                    observer.complete();

                    return;
                }

                //if auth error
                if(err.status == 403 || err.status == 401)
                {
                    observer.complete();    

                    return;
                }

                //other errors
                observer.error(err);
                observer.complete();
            }) as ObservableInput<HttpEvent<any>>;
        }));
    }
}

/**
 * Provider for proper use of SuppressAuthInterceptor, use this provider to inject this interceptor
 */
export const SUPPRESS_AUTH_INTERCEPTOR_PROVIDER: ClassProvider =
{
    provide: HTTP_INTERCEPTORS,
    multi: true,
    useClass: SuppressAuthInterceptor
};