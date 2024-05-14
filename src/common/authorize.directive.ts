import {Directive, TemplateRef, ViewContainerRef, OnInit, Input, OnDestroy, ChangeDetectorRef, OnChanges} from '@angular/core';
import {isString, isBoolean, isBlank} from '@jscrpt/common';
import {Subscription} from 'rxjs';

import {evaluatePermissions} from '../misc/utils';
import {AuthenticationService} from './authentication.service';
import {UserIdentity} from './userIdentity';

/**
 * Directive that displays element if use is authorized
 */
@Directive(
{
    selector: '[authorize]',
    standalone: true,
})
export class AuthorizeDirective implements OnInit, OnChanges, OnDestroy
{
    //######################### private fields #########################

    /**
     * Subscription for changes in authentication
     */
    private _subscription: Subscription|null = null;

    /**
     * Indication whether on init was already called or not
     */
    private _afterOnInit: boolean = false;

    /**
     * Indication whether is content rendered or not
     */
    private _rendered: boolean = false;

    //######################### public properties - inputs #########################

    /**
     * Name of permission that is requested for displaying element
     */
    @Input({alias: 'authorize', required: true})
    public permission!: string | string[];

    /**
     * Indication that AND condition should be used instead of OR condition if multiple permissions are provided
     */
    @Input('authorizeAndCondition')
    public andCondition: boolean = false;

    /**
     * Indication that provided string is set of loggical operations among permission names, if this is true andCondition is ignored
     */
    @Input('authorizeConditionString')
    public conditionString: boolean = false;

    /**
     * Additional condition that is added to evaluation of permission
     */
    @Input('authorizeAddCondition')
    public addCondition: boolean = true;
    
    //######################### constructor #########################
    constructor(private _template: TemplateRef<unknown>,
                private _viewContainer: ViewContainerRef,
                private _authService: AuthenticationService,
                private _changeDetector: ChangeDetectorRef)
    {
    }

    //######################### public methods - implementation of OnInit #########################

    /**
     * Initialize component
     */
    public ngOnInit(): void
    {
        if(isBlank(this.permission))
        {
            throw new Error('You must specify \'authorize\' attribute value.');
        }

        if(!isBoolean(this.andCondition))
        {
            throw new Error('Parameter \'andCondition\' must be boolean value!');
        }

        if(!isBoolean(this.conditionString))
        {
            throw new Error('Parameter \'conditionString\' must be boolean value!');
        }

        if(isString(this.permission) && this.permission.indexOf(',') > -1)
        {
            this.permission = this.permission.split(',').map(itm => itm.trim());
        }

        if(isBlank(this._authService.userIdentity))
        {
            throw new Error('AuthenticationService must be initialized before first use of AuthorizeDirective');
        }

        //synchronous render if permission is present
        this._renderIfPermission(this._authService.userIdentity);

        this._subscription = this._authService
            .authenticationChanged
            .subscribe(userIdentity =>
            {
                this._renderIfPermission(userIdentity);
                this._changeDetector.detectChanges();
            }, () => {});

        this._afterOnInit = true;
    }
    
    //######################### public methods - implementation of OnChanges #########################
    
    /**
     * Called when input value changes
     */
    public ngOnChanges(): void
    {
        if(!this._afterOnInit)
        {
            return;
        }

        this._renderIfPermission(this._authService.userIdentity);
    }

    //######################### public methods - implementation of OnDestroy #########################
    
    /**
     * Called when component is destroyed
     */
    public ngOnDestroy(): void
    {
        if(this._subscription)
        {
            this._subscription.unsubscribe();
            this._subscription = null;
        }
    }

    //######################### private methods #########################

    /**
     * Renders content if user has permissions
     */
    private _renderIfPermission(userIdentity: UserIdentity|null): void
    {
        if(!isString(this.permission) && !Array.isArray(this.permission))
        {
            throw new Error('Invalid argument type! Permission must be string or array of strings.');
        }

        if(userIdentity)
        {
            if(evaluatePermissions(userIdentity.permissions,
                                   this.permission,
                                   this.andCondition,
                                   this.conditionString,
                                   this.addCondition))
            {
                //already rendered, do nothing
                if(this._rendered)
                {
                    return;
                }

                this._viewContainer.clear();
                this._viewContainer.createEmbeddedView(this._template);

                this._rendered = true;
            }
            else
            {
                this._viewContainer.clear();

                this._rendered = false;
            }
        }
    }
}