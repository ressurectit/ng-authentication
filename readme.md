[![npm version](https://badge.fury.io/js/%40anglr%2Fauthentication.svg)](https://badge.fury.io/js/%40anglr%2Fauthentication)
[![Build status](https://ci.appveyor.com/api/projects/status/9hie89cl7n7wa8a7?svg=true)](https://ci.appveyor.com/project/kukjevov/ng-authentication)

# @anglr/authentication

Angular module for handling authentication and authorization. Provides a complete solution for managing user identity, permission-based access control, route guarding, HTTP interceptors for 401/403 handling, and template-level authorization directives and pipes.

## Table of Contents

- [Installation](#installation)
- [Architecture Overview](#architecture-overview)
- [Setup](#setup)
  - [1. Implement AuthenticationServiceOptions](#1-implement-authenticationserviceoptions)
  - [2. Register Providers](#2-register-providers)
- [Types](#types)
  - [UserIdentity](#useridentity)
  - [AccessToken](#accesstoken)
- [AuthenticationService](#authenticationservice)
- [Decorators](#decorators)
  - [@Authorize](#authorize)
  - [@ComponentRouteAuthorized](#componentrouteauthorized)
- [Route Guards](#route-guards)
  - [authGuard](#authguard)
  - [authGuardDefinition](#authguarddefinition)
- [Directives](#directives)
  - [AuthorizeDirective](#authorizedirective)
  - [LetAuthorizedDirective](#letauthorizeddirective)
- [Pipes](#pipes)
  - [HasPermissionPipe](#haspermissionpipe)
- [HTTP Interceptors](#http-interceptors)
  - [authInterceptor](#authinterceptor)
  - [suppressAuthInterceptor](#suppressauthinterceptor)
  - [AuthInterceptorOptions](#authinterceptoroptions)
- [Utility Functions](#utility-functions)
- [Testing](#testing)

## Installation

```bash
npm install @anglr/authentication --save
```

### Peer Dependencies

| Package | Version |
|---------|---------|
| `@angular/core` | `>=20.3.2` |
| `@angular/common` | `>=20.3.2` |
| `@angular/router` | `>=20.3.2` |
| `@anglr/common` | `>=23.0.0` |
| `@jscrpt/common` | `>=7.0.0` |
| `rxjs` | `>=7.5.7` |
| `tslib` | `^2.8.1` |

## Architecture Overview

| Layer | Component | Purpose |
|-------|-----------|---------|
| **Types** | `AccessToken`, `UserIdentity` | Data models for credentials and user identity |
| **Options** | `AuthenticationServiceOptions` | Abstract class - contract for app-specific auth implementation |
| **Service** | `AuthenticationService` | Central auth state management, login/logout, identity caching |
| **Decorators** | `@Authorize`, `@ComponentRouteAuthorized` | Declarative permission metadata on components/routes |
| **Guards** | `authGuard`, `authGuardDefinition()` | Route protection using decorator metadata |
| **Directives** | `AuthorizeDirective`, `LetAuthorizedDirective` | Template-level conditional rendering by permission |
| **Pipes** | `HasPermissionPipe` | Template expression permission checks |
| **Interceptors** | `authInterceptor`, `suppressAuthInterceptor` | HTTP 401/403 response handling |
| **Utils** | `evaluatePermissions`, `isAuthorized` | Shared permission evaluation logic |

## Setup

### 1. Implement AuthenticationServiceOptions

You must provide a concrete implementation of the abstract `AuthenticationServiceOptions` class. This defines how your app performs login, logout, fetches user identity, and handles navigation to auth/access-denied pages.

```typescript
import {Injectable} from '@angular/core';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {Observable, of, EMPTY} from 'rxjs';
import {AccessToken, AuthenticationServiceOptions, UserIdentity} from '@anglr/authentication';

@Injectable()
export class AccountAuthOptions extends AuthenticationServiceOptions
{
    constructor(private _router: Router,
                private _location: Location)
    {
        super();
    }

    public login(accessToken: AccessToken): Observable<void>
    {
        // Implement your login logic (e.g. call API, set cookies/tokens)
        return EMPTY;
    }

    public logout(): Observable<void>
    {
        // Implement your logout logic
        return EMPTY;
    }

    public getUserIdentity(): Observable<UserIdentity>
    {
        // Fetch user identity from your backend/auth provider
        return of(
        {
            isAuthenticated: true,
            userName: 'john.doe',
            firstName: 'John',
            surname: 'Doe',
            permissions: ['dashboard-page', 'users-list', 'reports-view'],
            additionalInfo: null,
        });
    }

    public isAuthPage(path?: string): boolean
    {
        const checkPath = path ?? this._location.path();
        return checkPath.indexOf('/login') === 0;
    }

    public showAuthPage(): Promise<boolean>
    {
        return this._router.navigate(['/login'], {
            queryParams: {returnUrl: this._location.path()},
        });
    }

    public showAccessDenied(): Promise<boolean>
    {
        return this._router.navigate(['/accessDenied']);
    }
}
```

### 2. Register Providers

Register the authentication options, interceptors, and initialize user identity on app startup.

```typescript
import {APP_INITIALIZER, ClassProvider, EnvironmentProviders, FactoryProvider, Provider, inject} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {AuthenticationService, AuthenticationServiceOptions, authInterceptor} from '@anglr/authentication';

import {AccountAuthOptions} from '../services/api/account/accountAuth.options';
import {routes} from './app.component.routes';

export const appProviders: (Provider | EnvironmentProviders)[] =
[
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),

    // Register your AuthenticationServiceOptions implementation
    <ClassProvider>
    {
        provide: AuthenticationServiceOptions,
        useClass: AccountAuthOptions,
    },

    // Initialize authentication on app startup
    provideAppInitializer(async () =>
    {
        const authService = inject(AuthenticationService);

        try
        {
            await authService
                .getUserIdentity();
        }
        catch(e)
        {
            alert(`Authentication initialization failed: ${e}`);

            throw e;
        }
    }),
];
```

## Types

### UserIdentity

Represents the authenticated user with their permissions.

```typescript
class UserIdentity<TUserInfo = unknown>
{
    isAuthenticated: boolean = false;
    userName: string = '';
    firstName: string = '';
    surname: string = '';
    permissions: string[] = [];
    additionalInfo: TUserInfo | null = null;
}
```

You can use the generic parameter to type `additionalInfo` with custom user data:

```typescript
interface MyUserInfo
{
    department: string;
    role: string;
}

// In your service
authService: AuthenticationService<MyUserInfo>;

// Access typed additional info
const dept = authService.userIdentity?.additionalInfo?.department;
```

### AccessToken

DTO used for authentication credentials.

```typescript
class AccessToken
{
    constructor(
        public userName: string,
        public password: string,
        public rememberMe: boolean,
    ) {}
}
```

## AuthenticationService

Central injectable service (`providedIn: 'root'`) for managing authentication state.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `isInitialized` | `Promise<boolean>` | Resolves after the first identity load |
| `authenticationChanged` | `Observable<UserIdentity>` | Emits when authentication state changes |
| `userIdentity` | `UserIdentity \| null` | Current cached user identity |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `isAuthorizedSync(permission)` | `boolean` | Synchronous permission check |
| `isAuthorized(permission)` | `Promise<boolean>` | Async permission check (fetches identity if needed) |
| `getUserIdentity(refresh?)` | `Promise<UserIdentity>` | Gets user identity; caches unless `refresh=true` |
| `login(accessToken)` | `Observable<UserIdentity>` | Logs in, then refreshes identity |
| `logout()` | `Observable<void>` | Logs out, then refreshes identity |
| `showAuthPage()` | `Promise<boolean>` | Redirects to authentication page |
| `showAccessDenied()` | `Promise<boolean>` | Redirects to access denied page |
| `isAuthPage(path?)` | `boolean` | Checks if current/given path is the auth page |

### Usage Example

```typescript
import {Component, OnInit, OnDestroy, inject} from '@angular/core';
import {Subscription} from 'rxjs';
import {AuthenticationService, UserIdentity} from '@anglr/authentication';

@Component({...})
export class MainMenuComponent implements OnInit, OnDestroy
{
    private _subscription: Subscription | null = null;
    private _authService = inject(AuthenticationService);

    public userName: string = '';
    public isAuthenticated: boolean = false;

    public ngOnInit(): void
    {
        this._authService.getUserIdentity().then((identity: UserIdentity) =>
        {
            this.userName = `${identity.firstName} ${identity.surname}`;
            this.isAuthenticated = identity.isAuthenticated;
        });

        this._subscription = this._authService.authenticationChanged
            .subscribe((identity: UserIdentity) =>
            {
                this.userName = `${identity.firstName} ${identity.surname}`;
                this.isAuthenticated = identity.isAuthenticated;
            });
    }

    public ngOnDestroy(): void
    {
        this._subscription?.unsubscribe();
    }

    public logout(): void
    {
        this._authService.logout().subscribe();
    }
}
```

## Decorators

### @Authorize

Class decorator that attaches permission metadata to a component. Used in conjunction with `authGuard` to protect routes. Route must be defined using `ComponentRoute` decorator from `@anglr/common/router`. Use together with `ModuleRoutes` (creates lazy route module) decorator or `extractRoutes` (extracts routes from components) function from `@anglr/common/router`.

```typescript
import {Authorize} from '@anglr/authentication';
```

#### Single Permission

```typescript
@Component({...})
@Authorize('dashboard-page')
export class DashboardComponent {}
```

#### Multiple Permissions (OR - user needs at least one)

```typescript
@Component({...})
@Authorize(['admin', 'manager'])
export class ReportsComponent {}
```

#### Multiple Permissions (AND - user needs all)

```typescript
@Component({...})
@Authorize({permission: ['edit', 'publish'], andCondition: true})
export class PublishComponent {}
```

#### Condition String (logical expression)

```typescript
@Component({...})
@Authorize({permission: 'admin && (editor || reviewer)', conditionString: true})
export class ContentComponent {}
```

#### Route-Specific Permissions

When a single component is used for multiple routes with different permission requirements:

```typescript
@Component({...})
@Authorize('view-page')
@Authorize({permission: 'edit-page'}, 'edit/:id')
export class ResourceComponent {}
```

#### With Additional Runtime Condition

```typescript
@Component({...})
@Authorize(
{
    permission: 'download',
    addCondition: (injector) =>
    {
        const config = injector.get(AppConfig);
        return config.isDownloadEnabled;
    },
})
export class DownloadComponent {}
```

#### AuthorizeOptions Interface

```typescript
interface AuthorizeOptions
{
    permission: string | string[];
    andCondition?: boolean;       // true = AND logic, false = OR logic (default)
    conditionString?: boolean;    // true = parse permission as logical expression
    addCondition?: (injector: Injector) => PromiseOr<boolean>; // extra runtime condition
}
```

### @ComponentRouteAuthorized

Convenience decorator that combines `@ComponentRoute` (from `@anglr/common/router`) with automatic `authGuard` injection. Eliminates the need to manually add `canActivate: [authGuard]` to every route.

```typescript
import {Authorize, ComponentRouteAuthorized} from '@anglr/authentication';

@Component(
{
    selector: 'overview-view',
    templateUrl: 'overview.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
@ComponentRouteAuthorized({path: 'overview'})
@Authorize('users-list-page')
export class OverviewComponent {}
```

This is equivalent to:

```typescript
@ComponentRoute({path: 'overview', canActivate: [authGuard]})
@Authorize('users-list-page')
export class OverviewComponent {}
```

## Route Guards

### authGuard

Default `CanActivateFn` guard that reads permission metadata from the `@Authorize` decorator on route components.

```typescript
import {authGuard} from '@anglr/authentication';

const routes: Routes = [
    {path: 'admin', component: AdminComponent, canActivate: [authGuard]},
    {path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
];
```

**How it works:**
1. Reads `@Authorize` metadata from the route's component
2. Checks route-specific permissions first, then component-level permissions
3. If no permissions defined → allows access
4. If user is authenticated but unauthorized → calls `showAccessDenied()`
5. If user is not authenticated → calls `showAuthPage()`

### authGuardDefinition

Factory function for creating guards with explicit permission overrides (ignoring decorator metadata). Used for lazy component routes.

```typescript
import {authGuardDefinition} from '@anglr/authentication';

// Guard with specific permission
const adminGuard = authGuardDefinition('admin-access');

// Guard with multiple permissions (OR)
const editorGuard = authGuardDefinition(['read', 'write']);

// Guard with full AuthorizeOptions
const advancedGuard = authGuardDefinition(
{
    permission: ['admin', 'moderator'],
    andCondition: false,
    addCondition: (injector) =>
    {
        const featureFlags = injector.get(FeatureFlagService);

        return featureFlags.isEnabled('admin-panel');
    },
});

const routes: Routes = 
[
    {path: 'admin', component: AdminComponent, canActivate: [adminGuard]},
    {path: 'editor', component: EditorComponent, canActivate: [editorGuard]},
];
```

## Directives

### AuthorizeDirective

Structural directive that conditionally renders its host template based on user permissions. The template is created when the user has the required permission(s) and removed when they don't.

**Selector:** `[authorize]` (standalone)

**Inputs:**

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `authorize` | `string \| string[]` | *required* | Permission name(s) to check |
| `authorizeAndCondition` | `boolean` | `false` | Use AND logic for multiple permissions |
| `authorizeConditionString` | `boolean` | `false` | Parse permission as logical expression |
| `authorizeAddCondition` | `boolean` | `true` | Extra boolean condition AND-ed with result |

**Usage:**

```typescript
import {AuthorizeDirective} from '@anglr/authentication';

@Component(
{
    imports: [AuthorizeDirective],
    ...
})
export class MyComponent {}
```

```html
<!-- Show element only if user has 'admin' permission -->
<div *authorize="'admin'">
    Admin Panel
</div>

<!-- Show element if user has BOTH 'read' AND 'write' permissions -->
<div *authorize="['read', 'write']; andCondition: true">
    Edit Content
</div>

<!-- Show/hide menu items based on permissions -->
<nav>
    <a routerLink="/dashboard" *authorize="'dashboard-page'">Dashboard</a>
    <a routerLink="/users" *authorize="'users-list-page'">Users</a>
    <a routerLink="/reports" *authorize="'reports-view'">Reports</a>
    <a routerLink="/settings" *authorize="'admin'">Settings</a>
</nav>

<!-- Condition string with logical operators -->
<div *authorize="'admin || moderator'; conditionString: true">
    Management Panel
</div>

<!-- With additional runtime condition -->
<button *authorize="'delete'; addCondition: isOwner">
    Delete
</button>
```

**Real-world example** (menu with permission-based visibility):

```html
<ul class="nav-menu">
    <li *authorize="'authenticated'">
        <a routerLink="/home">Home</a>
    </li>
    <li *authorize="'waitingListsOverviewPage'">
        <a routerLink="/waitingLists/overview">Waiting Lists</a>
    </li>
    <li *authorize="'controlsOverviewPage'">
        <a routerLink="/controls/overview">Controls</a>
    </li>
    <li *authorize="'debugInfo'">
        <a routerLink="/debug">Debug Info</a>
    </li>
</ul>
```

### LetAuthorizedDirective

Structural directive that always renders its template and exposes the authorization result as a template variable. Unlike `AuthorizeDirective` which hides/shows content, this directive lets you use the result in template expressions.

**Selector:** `[letAuthorized]` (standalone, exportAs: `'authorized'`)

**Inputs:**

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `letAuthorized` | `string \| string[]` | *required* | Permission name(s) to check |
| `letAuthorizedAndCondition` | `boolean` | `false` | Use AND logic |
| `letAuthorizedConditionString` | `boolean` | `false` | Parse as logical expression |
| `letAuthorizedAddContition` | `boolean` | `true` | Extra boolean condition |

**As structural directive** (template variable via context):

```html
<!-- The authorized boolean is available as implicit context -->
<ng-container *letAuthorized="'edit'; let authorized">
    <button [disabled]="!authorized">Edit</button>

    @if(!authorized)
    {
        <span class="text-muted">No edit permission</span>
    }
</ng-container>
```

**As attribute directive** (access via template reference):

```html
<div letAuthorized="delete" #canDelete="authorized">
    <button [disabled]="!canDelete.value" (click)="delete()">Delete</button>
</div>
```

## Pipes

### HasPermissionPipe

Pure pipe for checking permissions in template expressions. Returns `boolean`.

**Name:** `hasPermission` (standalone)

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `condition` | `string \| string[]` | - | Permission name(s) |
| `andCondition` | `boolean` | `false` | AND logic for multiple permissions |
| `conditionString` | `boolean` | `false` | Parse as logical expression |
| `addCondition` | `boolean` | `true` | Extra boolean condition |

**Usage:**

```typescript
import {HasPermissionPipe} from '@anglr/authentication';

@Component(
{
    imports: [HasPermissionPipe],
    ...
})
export class MyComponent {}
```

```html
<!-- Use in @if control flow -->
@if ('edit-permission' | hasPermission) 
{
    <input [(ngModel)]="value" />
} 
@else 
{
    <span>{{value}}</span>
}

<!-- Disable button based on permission -->
<button [disabled]="!('save-permission' | hasPermission)" (click)="save()">
    Save
</button>

<!-- AND condition: user must have both permissions -->
<button [disabled]="!(['read', 'write'] | hasPermission: true)">
    Publish
</button>

<!-- Condition string with logical operators -->
@if('admin || moderator' | hasPermission: false: true)
{
    <div>
        Management Section
    </div>
}

<!-- Combine with other conditions -->
<button [disabled]="!('ecakacky_kontrolyUpdateStav' | hasPermission) || isLoading"
        (click)="updateStatus()">
    Update Status
</button>
```

## HTTP Interceptors

### authInterceptor

Functional HTTP interceptor that handles `401 Unauthorized` and `403 Forbidden` responses globally.

**Behavior:**
- On **401/403** response: refreshes user identity, then:
  - If user is authenticated → calls `showAccessDenied()`
  - If user is not authenticated → calls `showAuthPage()`
- Uses blocking mechanism to prevent multiple concurrent auth redirects
- Respects `IGNORED_INTERCEPTORS` context token
- Ignores auth errors on the auth page itself

```typescript
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from '@anglr/authentication';

export const appProviders = 
[
    provideHttpClient(withInterceptors([authInterceptor])),
];
```

### suppressAuthInterceptor

Functional HTTP interceptor that silently suppresses `401/403` errors (completes the observable without emitting an error). Used for hiding auth errors from user/caller of called API.

```typescript
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor, suppressAuthInterceptor} from '@anglr/authentication';

export const appProviders = 
[
    provideHttpClient(withInterceptors([authInterceptor, suppressAuthInterceptor])),
];
```

### AuthInterceptorOptions

Configuration class for `authInterceptor`.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `treatUnauthorizedAsForbidden` | `boolean` | `false` | When `true`, treats 401 the same as 403 (shows access denied for authenticated users instead of auth page) |

```typescript
import {AuthInterceptorOptions} from '@anglr/authentication';

export const appProviders = 
[
    {
        provide: AuthInterceptorOptions,
        useValue: new AuthInterceptorOptions(true),
    },
    provideHttpClient(withInterceptors([authInterceptor])),
];
```

## Utility Functions

### isAuthorized

Convenience function that checks permissions against the current user identity from `AuthenticationService`.

```typescript
const hasAccess = isAuthorized(authService, 'admin');
const hasAll = isAuthorized(authService, ['read', 'write'], true); // AND condition
```

### evaluatePermissions

Core permission evaluation function. Can be used independently of `AuthenticationService`.

```typescript
const userPermissions = ['read', 'write', 'admin'];

// OR condition (default) - has at least one
evaluatePermissions(userPermissions, ['admin', 'superadmin']); // true

// AND condition - has all
evaluatePermissions(userPermissions, ['admin', 'superadmin'], true); // false

// Condition string - logical expression
evaluatePermissions(userPermissions, 'admin && (read || delete)', false, true); // true
```

## Complete Example

Here is a full example putting all the pieces together:

### App Providers

```typescript
// app.providers.ts
import {APP_INITIALIZER, ClassProvider, FactoryProvider, Provider, inject} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {AuthenticationService, AuthenticationServiceOptions, authInterceptor} from '@anglr/authentication';

import {AccountAuthOptions} from '../services/api/account/accountAuth.options';
import {routes} from './app.component.routes';

export const appProviders: Provider[] =
[
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),

    <ClassProvider>
    {
        provide: AuthenticationServiceOptions,
        useClass: AccountAuthOptions,
    },

    provideAppInitializer(async () =>
    {
        const authService = inject(AuthenticationService);

        try
        {
            await authService
                .getUserIdentity();
        }
        catch(e)
        {
            alert(`Authentication initialization failed: ${e}`);

            throw e;
        }
    }),
];
```

### Protected Page Component

```typescript
// admin.component.ts
import {Component, ChangeDetectionStrategy} from '@angular/core';
import {Authorize, ComponentRouteAuthorized, AuthorizeDirective, HasPermissionPipe} from '@anglr/authentication';

@Component(
{
    selector: 'admin-view',
    templateUrl: 'admin.component.html',
    imports: [AuthorizeDirective, HasPermissionPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
@ComponentRouteAuthorized({path: 'admin'})
@Authorize('admin-page')
export class AdminComponent {}
```

```html
<!-- admin.component.html -->
<h1>Admin Dashboard</h1>

<div *authorize="'admin-users-manage'">
    <h2>User Management</h2>
    <button [disabled]="!('admin-users-create' | hasPermission)">
        Create User
    </button>
</div>

<div *authorize="'admin-settings'">
    <h2>Settings</h2>
    <!-- settings content -->
</div>
```

## License

MIT

