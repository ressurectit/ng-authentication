import {Input, Directive, TemplateRef, ViewContainerRef} from '@angular/core';

/**
 * Fake authorize directive for tests
 */
@Directive(
{
    selector: '[authorize]'
})
export class FakeAuthorizeDirective
{
    //######################### public properties - inputs #########################

    /**
     * Name of permission that is requested for displaying element
     */
    @Input('authorize')
    public permission: string | string[] = null!;

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

    //######################### constructor #########################
    constructor(private _template: TemplateRef<unknown>,
                private _viewContainer: ViewContainerRef)
    {
        this._viewContainer.createEmbeddedView(this._template);
    }
}