import {ApplicationConfig} from '@angular/core';
import {provideAnimations} from '@angular/platform-browser/animations';

import {appProviders} from './app.providers';

/**
 * Application configuration for browser
 */
export const appConfig: ApplicationConfig = 
{
    providers:
    [
        ...appProviders,
        provideAnimations(),
    ],
};
