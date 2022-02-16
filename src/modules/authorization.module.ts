import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AuthorizeDirective} from '../common/authorize.directive';
import {LetAuthorizedDirective} from '../common/letAuthorized.directive';

/**
 * Module for authorization 
 */
@NgModule(
{
    imports: [CommonModule],
    declarations: [AuthorizeDirective, LetAuthorizedDirective],
    exports: [AuthorizeDirective, LetAuthorizedDirective]
})
export class AuthorizationModule
{
}