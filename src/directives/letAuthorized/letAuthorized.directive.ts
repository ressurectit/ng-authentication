import {ChangeDetectorRef, Directive, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';
import {isBlank, nameof} from '@jscrpt/common';
import {Subscription} from 'rxjs';

import {evaluatePermissions} from '../../misc/utils';
import {AuthenticationService} from '../../services';
import type {UserIdentity} from '../../misc/types';

/**
 * Context used withing template of LetAuthorizedDirective (if used as structural directive)
 */
export interface LetAuthorizedContext
{
    $implicit: boolean;
    letAuthorized: boolean;
}

/**
 * Directive that can be used both as structural and attribute directive, allows getting 'authorized' result in template for specified condition
 */
@Directive(
{
    selector: '[letAuthorized]',
    exportAs: 'authorized',
    standalone: true,
})
export class LetAuthorizedDirective implements OnInit, OnChanges, OnDestroy
{
    //######################### protected fields #########################

    /**
     * Current evaluated value of authorized condition
     */
    protected _value: boolean = false;

    /**
     * Subscription for changes in authentication
     */
    protected _subscription: Subscription|null = null;

    //######################### public properties #########################

    /**
     * Current evaluated value of authorized condition
     */
    public get value(): boolean
    {
        return this._value;
    }

    //######################### public properties - inputs #########################

    /**
     * Condition that should be evaluated and used for obtaining authorized result
     */
    @Input('letAuthorized')
    public condition: string | string[] = null!;

    /**
     * Indication that AND condition should be used instead of OR condition if multiple permissions are provided
     */
    @Input('letAuthorizedAndCondition')
    public andCondition: boolean = false;

    /**
     * Indication that provided string is set of loggical operations among permission names, if this is true andCondition is ignored
     */
    @Input('letAuthorizedConditionString')
    public conditionString: boolean = false;

    /**
     * Additional condition that is added to evaluation of permission
     */
    @Input('letAuthorizedAddContition')
    public addCondition: boolean = true;

    //######################### constructor #########################
    constructor(protected _viewContainerRef: ViewContainerRef,
                protected _authSvc: AuthenticationService,
                protected _changeDetector: ChangeDetectorRef,
                @Optional() protected _templateRef?: TemplateRef<LetAuthorizedContext>)
    {
    }

    //######################### public methods - implementation of OnInit #########################
    
    /**
     * Initialize component
     */
    public ngOnInit(): void
    {
        if(isBlank(this.condition))
        {
            throw new Error('You must specify \'authorize\' attribute value.');
        }

        this._subscription = this._authSvc
            .authenticationChanged
            .subscribe(userIdentity =>
            {
                this._processAuthorization(userIdentity);
                this._changeDetector.detectChanges();
            }, () => {});
    }

    //######################### public methods - implementation of OnChanges #########################
    
    /**
     * Called when input value changes
     */
    public ngOnChanges(changes: SimpleChanges): void
    {
        if(nameof<LetAuthorizedDirective>('condition') in changes ||
           nameof<LetAuthorizedDirective>('addCondition') in changes)
        {
            this._processAuthorization(this._authSvc.userIdentity);
        }
    }

    //######################### public methods - implementation of OnDestroy #########################
    
    /**
     * Called when component is destroyed
     */
    public ngOnDestroy(): void
    {
        this._subscription?.unsubscribe();
        this._subscription = null;
    }

    //######################### protected methods #########################

    /**
     * Process authorization
     * @param userIdentity - Current user identity instance
     */
    protected _processAuthorization(userIdentity: UserIdentity|null): void
    {
        this._evaluateAuthorization(userIdentity);

        if(this._templateRef)
        {
            this._viewContainerRef.clear();

            this._viewContainerRef.createEmbeddedView(this._templateRef,
            {
                $implicit: this._value,
                letAuthorized: this._value
            });
        }
    }

    /**
     * Evaluates authorization condition
     * @param userIdentity - Current user identity instance
     */
    protected _evaluateAuthorization(userIdentity: UserIdentity|null): void
    {
        if(!userIdentity)
        {
            this._value = false;

            return;
        }

        this._value = evaluatePermissions(userIdentity.permissions,
                                          this.condition,
                                          this.andCondition,
                                          this.conditionString,
                                          this.addCondition);
    }
}
