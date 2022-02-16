import {NgModule} from '@angular/core';

import {FakeAuthorizeDirective} from '../common/fakeAuthorize.directive';

/**
 * Module for fake directives, components and other stuff for Authorization module testing
 */
@NgModule(
{
    declarations: [FakeAuthorizeDirective],
    exports: [FakeAuthorizeDirective]
})
export class TestingModule
{
}