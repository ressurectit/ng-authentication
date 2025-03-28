# Changelog

## Version 12.1.0 (2025-03-14)

### Features

- new `authGuardDefinition` function, that creates authGuard using permission definition, use with lazy component routes

## Version 12.0.0 (2024-05-14)

### Features

- removed deprecated `rxjs` pipes usagess
- new `authGuard` can activate fn, that represents routing guard that is used for authorization of user
- new `HasPermissionPipe` pipe, that tests whether user has permission
    - is `standalone`
- updated `AuthorizeDirective` directive
    - is now `standalone`
- updated `LetAuthorizedDirective` directive
    - is now `standalone`
- updated `AuthGuard` can activate type
    - changed to can activate fn and is deprecated in favor of `authGuard`

### BREAKING CHANGES

- minimal supported version of `node.js` is `18`
- minimal supported version of `@angular` is `17.3.0`
- minimal supported version of `@jscrpt/common` is `6.0.0`
- minimal supported version of `@anglr/common` is `19.0.0`
- minimal supported version of `tslib` is `2.6.2`
- updated all `any` to `unknown` generic type defaults
- removed `AuthorizationModule` module, both directives declared in it are now `standalone`

## Version 11.0.0 (2022-09-07)

### BREAKING CHANGES

- dropped support of `Node.js` version `12`
- minimal supported version of `rxjs` is now `7.5.0`
- minimal supported version of `@jscrpt/common` is now `3.0.0`
- minimal supported version of `tslib` is now `2.4.0`

## Version 10.0.0 (2022-02-24)

### Bug Fixes

- `AuthorizeDirective` now check permissions also when one of inputs have changed
- fixed `AuthGuard`, now correctly blocks changing of route from login page using links or navigations using router

### Features

- new `AuthorizeOptions` interface, options passed to `Authorize` decorator
    - property `permission` name of permission or array of permissions that is requested for displaying component
    - property `andCondition` indication that AND condition should be used instead of OR condition if multiple permissions are provided
    - property `conditionString` indication that provided string is set of loggical operations among permission names, if this is true andCondition is ignored
    - property `addCondition` callback for additional condition that is added to evaluation of permission
- `Authorize` decorator
    - now accepts also array of permission names and `AuthorizeOptions`
    - allows to set authorize for specific route using second parameter, overriding common authorize if specified
    - updated `AuthGuard` to be able to work with this new type of `Authorize` decorator
- new `ComponentRouteAuthorized` decorator, which defines route for component on which is this decorator applied, automatically adds `AuthGuard`

### BREAKING CHANGES

- `AuthGuard` has new parameters in constructor (`Injector`, `Router`)
- `AuthenticationServiceOptions` class
    - `isAuthPage` method has new parameter path which allows also checking specified path whether is auth page
- `AuthenticationService` class
    - `isAuthPage` method has new parameter path which allows also checking specified path whether is auth page

## Version 9.0.1 (2022-02-22)

### Bug Fixes

- fixed typings, not using rolled up typings for now

## Version 9.0.0 (2022-02-16)

### Features

- `AuthenticationServiceOptions` generic type has default `any` now

### BREAKING CHANGES

- minimal supported version of *Angular* is `13.1.0`
- minimal supported version of `@jscrpt/common` is `2.2.0`
- minimal supported version of `@anglr/common` is `10.0.0`
- compiled as *Angular IVY* **only** with new *APF*
- removed support of *es5* target and using latest package.json features
- added strict null checks
- dropped support of `Node.js <= 12.20`
- changed signature of constructor of `AuthInterceptor`
- `AccessToken` now has constructor with initializators
- `AuthenticationServiceOptions` interface
    - now changed to class instead of interface
    - `login`, `logout` methods now returns `Observable<void>`
- `AuthenticationService` class
    - `userIdentity` fixed typings, now is correctly nullable
- `AUTHENTICATION_SERVICE_OPTIONS` removed, now should be used `AuthenticationServiceOptions` directly
- `UserIdentity` class
    - `additionalInfo` fixed typings, now is correctly nullable

## Version 8.0.1 (2022-02-16)

### Bugfixes

- fixed compilation errors because of wrong deps versions

## Version 8.0.0 (2022-02-15)

### Bugfixes
- `AuthenticationService` `login` method now returns `UserIdentity` instead of any
- fixed `AuthenticationService` `login`, `logout` methods, now complete observables (could not be used with `toPromise` before)

### Features

- added new `AuthInterceptorOptions` as options for `AuthInterceptor`
    - new option `treatUnauthorizedAsForbidden`, which allows treating *401* as *403* http code
- for `AuthenticationService`
    - added new property `userIdentity`, storing last value of `UserIdentity`
    - added new method `isAuthorizedSync`, used for synchronous checking whether user has *permission*
- for `AuthorizeDirective`
    - added new `addCondition` which adds additional condition that is added to evaluation of permission
- added new `evaluatePermissions` function allowing use same (as used anywhere in package) permissions evaluation logic anywhere
- added new `isAuthorized` function to get indication whether user is authorized
- added new `LetAuthorizedDirective` allowing easy way to getting evaluated permission
- `AuthenticationService` generic type has default `any` now
- `UserIdentity` generic type has default `any` now

### BREAKING CHANGES

- minimal supported version of *Angular* is `10.0.0`
- minimal supported version of `@jscrpt/common` is `1.2.0`
- minimal supported version of `@anglr/common` is `9.0.0`
- removed `AuthInterceptorConfig`, now using `AuthenticationService` instead
- `AuthorizeDirective` now initialy working synchronously
- `AuthInterceptor` has new constructor parameters
    - default behavior of `AuthInterceptor` is not to treat *401* as *403* http code as was before

## Version 7.0.0

- updated to latest stable *Angular* 9
- added generating of API doc

## Version 6.0.0

- Angular IVY ready (APF compliant package)
- added support for ES2015 compilation
- Angular 8

## Version 5.0.2
 - added new interceptor `suppressAuthInterceptor`
 - updated `authInterceptor`, now supports blocking multiple parallel requests

## Version 5.0.1
 - updated regular expression for `conditionString` for `AuthorizeDirective`, now should support `!` statements

## Version 5.0.0
 - stabilized for angular v6

## Version 5.0.0-beta.2
 - `@anglr/authentication` is now marked as *sideEffects* free
 - removed `forRoot` methods from `AuthorizationModule`
 - guard `AuthGuard` is now *tree-shakeable*
 - provider `AUTHENTICATION_SERVICE_OPTIONS` must be provided explictly
 - provider `AuthenticationService` is now *tree-shakeable*

## Version 5.0.0-beta.1
 - aktualizácia balíčkov `Angular` na `6`
 - aktualizácia `Webpack` na verziu `4`
 - aktualizácia `rxjs` na verziu `6`
 - automatické generovanie dokumentácie

## Version 4.0.5
 - `AuthorizeDirective` now supports condition expressions if `conditionString` is set to true

## Version 4.0.4
 - `AuthInterceptor` now handles also `isAuthenticated` rejection

## Version 4.0.3
 - moved `AuthInterceptor` from `@anglr/http-extensions`
 - `AuthInterceptor` now using `HttpRequestIgnoredInterceptorId`

## Version 4.0.2
 - returned typescript version back to 2.4.2 and removed distJit

## Version 4.0.1
 - added compiled outputs for Angular JIT

## Version 4.0.0
 - updated angular to 5.0.0 (final)
 - changed dependencies of project to peerDependencies
 - more strict compilation
 - updated usage of rxjs, now using operators

## Version 4.0.0-beta.0
 - updated angular to >=5.0.0-rc.7