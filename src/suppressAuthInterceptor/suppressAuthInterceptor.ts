import {ClassProvider, Injectable} from '@angular/core';
import {HttpInterceptor, HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpRequest} from '@angular/common/http';
import {IGNORED_INTERCEPTORS} from '@anglr/common';
import {Observable, ObservableInput} from 'rxjs';
import {catchError} from 'rxjs/operators';

/**
 * SuppressAuthInterceptor used for intercepting http responses and suppressing 401, 403 statuses
 */
@Injectable()
export class SuppressAuthInterceptor implements HttpInterceptor
{
    //######################### public methods - implementation of HttpInterceptor #########################

    /**
     * Intercepts http request
     * @param req - Request to be intercepted
     * @param next - Next middleware that can be called for next processing
     */
    public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>>
    {
        return next.handle(req).pipe(catchError((err) =>
        {
            return new Observable(observer =>
            {
                //client error, not response from server, or is ignored
                if (err.error instanceof Error || 
                    req.context.get(IGNORED_INTERCEPTORS).some(itm => itm == SuppressAuthInterceptor))
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
            }) as ObservableInput<HttpEvent<unknown>>;
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