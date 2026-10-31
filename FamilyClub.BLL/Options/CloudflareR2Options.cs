namespace FamilyClub.BLL.Options;

public class CloudflareR2Options
{
    public const string SectionName = "CloudflareR2";

    /// <summary>
    /// Cloudflare Account ID.
    /// Used to generate ServiceUrl: https://{AccountId}.r2.cloudflarestorage.com
    /// </summary>
    public string? AccountId { get; set; }

    /// <summary>
    /// Explicit Service URL (e.g. https://[account_id].r2.cloudflarestorage.com).
    /// </summary>
    public string? ServiceUrl { get; set; }

    /// <summary>
    /// The Cloudflare R2 bucket name.
    /// </summary>
    public string? BucketName { get; set; }

    /// <summary>
    /// Cloudflare R2 Access Key ID.
    /// </summary>
    public string? AccessKeyId { get; set; }

    /// <summary>
    /// Cloudflare R2 Secret Access Key.
    /// </summary>
    public string? SecretAccessKey { get; set; }

    /// <summary>
    /// Optional public base URL or custom domain for the bucket
    /// (e.g. https://pub-xxxxxxxx.r2.dev or https://images.familyclub.com).
    /// When set, generated public URLs will be: {PublicUrl}/{Key}.
    /// </summary>
    public string? PublicUrl { get; set; }

    /// <summary>
    /// Whether to force path-style S3 URLs (required for Cloudflare R2). Default is true.
    /// </summary>
    public bool ForcePathStyle { get; set; } = true;

    /// <summary>
    /// Returns true if the required settings to connect to Cloudflare R2 are configured.
    /// </summary>
    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(BucketName) &&
        !string.IsNullOrWhiteSpace(AccessKeyId) &&
        !string.IsNullOrWhiteSpace(SecretAccessKey) &&
        (!string.IsNullOrWhiteSpace(ServiceUrl) || !string.IsNullOrWhiteSpace(AccountId));

    public string GetServiceUrl()
    {
        if (!string.IsNullOrWhiteSpace(ServiceUrl))
        {
            return ServiceUrl.TrimEnd('/');
        }

        if (!string.IsNullOrWhiteSpace(AccountId))
        {
            return $"https://{AccountId.Trim()}.r2.cloudflarestorage.com";
        }

        return string.Empty;
    }
}

