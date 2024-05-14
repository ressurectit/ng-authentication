import {FactoryProvider, APP_INITIALIZER, ClassProvider, Provider, EnvironmentProviders, inject, provideZoneChangeDetection} from '@angular/core';
import {provideClientHydration} from '@angular/platform-browser';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {AuthenticationService, AuthenticationServiceOptions} from '@anglr/authentication';
import {GlobalizationService} from '@anglr/common';

import {routes} from './app.component.routes';
import {GlobalizationService as GlobalizationServiceImpl} from '../services/globalization/globalization.service';
import {AccountAuthOptions} from '../services/api/account/accountAuth.options';

/**
 * Array of providers that are used in app module
 */
export const appProviders: (Provider|EnvironmentProviders)[] =
[
    //######################### ROUTER #########################
    provideRouter(routes,
                  withComponentInputBinding()),

    //######################### CLIENT HYDRATION #########################
    provideClientHydration(),

    //######################### ZONE #########################
    provideZoneChangeDetection({eventCoalescing: true, runCoalescing: true}),

    //######################### GLOBALIZATION SERVICE #########################
    <ClassProvider>
    {
        provide: GlobalizationService,
        useClass: GlobalizationServiceImpl
    },

    //######################### AUTHENTICATION & AUTHORIZATION #########################
    <ClassProvider>
    {
        provide: AuthenticationServiceOptions,
        useClass: AccountAuthOptions
    },

    //######################### APP INITIALIZER #########################
    <FactoryProvider>
    {
        provide: APP_INITIALIZER,
        multi: true,
        useFactory: () =>
        {
            const authService = inject(AuthenticationService);

            return async () =>
            {
                try
                {
                    await authService
                        .getUserIdentity();
                }
                catch(e)
                {
                    alert(`Authentication failed: ${e}`);

                    throw e;
                }
            };
        }
    },
];
