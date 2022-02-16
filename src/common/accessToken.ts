/**
 * Access token containing information for authentication
 */
export class AccessToken
{
    //######################### constructor #########################

    /**
     * Creates instance of `AccessToken`
     * @param userName - username used for authentication
     * @param password - password used for authentication
     * @param rememberMe - indication that user should be remembered for next access
     */
    constructor(public userName: string,
                public password: string,
                public rememberMe: boolean)
    {
    }
}
