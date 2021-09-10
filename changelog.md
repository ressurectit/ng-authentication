# Changelog

## Version 8.0.0 (2021-09-10)

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
- minimal supported version of `@anglr/common` is `8.0.0`
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