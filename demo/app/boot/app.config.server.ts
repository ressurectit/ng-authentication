import {mergeApplicationConfig, ApplicationConfig} from '@angular/core';
import {provideServerRendering} from '@angular/platform-server';

import {appConfig} from './app.config';

//Server configuration
const serverConfig: ApplicationConfig = 
{
    providers: 
    [
        provideServerRendering(),
    ]
};

/**
 * Application configuration for server merged with browser configuration
 */
export const config = mergeApplicationConfig(appConfig, serverConfig);
