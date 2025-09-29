import {Injectable} from '@angular/core';

/**
 * Stores data for `authInterceptor`
 */
@Injectable({providedIn: 'root'})
export class AuthInterceptorData
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

    //######################### public properties #########################

    /**
     * Counter for requests in progress
     */
    public get requestsInProgress(): number
    {
        return this._requestsInProgress;
    }
    public set requestsInProgress(value: number)
    {
        this._requestsInProgress = value;

        if(value < 1)
        {
            this._blocked = false;
            this._requestsInProgress = 0;
        }
    }

    /**
     * Gets indication whether is handling of 401, 403 blocked because one request is already handled
     */
    public get blocked(): boolean
    {
        return this._blocked;
    }

    //######################### public methods #########################
    
    /**
     * Sets blocked to true
     */
    public setBlocked(): void
    {
        this._blocked = true;
    }
}
