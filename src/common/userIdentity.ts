/**
 * Information about user in accessing system
 */
export class UserIdentity<TUserInfo = any>
{
    //######################### public properties #########################
    
    /**
     * Indication whether is user authenticated
     */
    public isAuthenticated: boolean = false;
    
    /**
     * Name of authenticated user
     */
    public userName: string = '';
    
    /**
     * First name of logged user
     */
    public firstName: string = '';
    
    /**
     * Surname of logged user
     */
    public surname: string = '';
    
    /**
     * Array of user permissions
     */
    public permissions: string[] = [];

    /**
     * Additional information carried with user identity
     */
    public additionalInfo: TUserInfo;
}