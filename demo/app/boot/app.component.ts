import {Component, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

/**
 * Application root component
 */
@Component(
{
    selector: 'app',
    templateUrl: 'app.component.html',
    styleUrl: 'app.component.scss',
    standalone: true,
    imports:
    [
        CommonModule,
        RouterModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSAComponent
{
}