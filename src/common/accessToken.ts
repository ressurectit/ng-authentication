/**
 * Access token containing information for authentication
 */
export class AccessToken
{
    /**
     * Username used for authentication
     */
    public userName: string;
    
    /**
     * Password used for authentication
     */
    public password: string;
    
    /**
     * Indication that user should be remembered for next access
     */
    public rememberMe: boolean;
}