using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using FamilyClub.BLL.Interfaces;
using FamilyClub.BLL.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FamilyClub.BLL.Services;

public class CloudflareR2StorageService : IStorageService, IDisposable
{
    private readonly CloudflareR2Options _options;
    private readonly ILogger<CloudflareR2StorageService> _logger;
    private readonly IAmazonS3? _s3Client;

    public bool IsConfigured => _options.IsConfigured && _s3Client != null;

    public CloudflareR2StorageService(
        IOptions<CloudflareR2Options> options,
        ILogger<CloudflareR2StorageService> logger)
    {
        _options = options.Value;
        _logger = logger;

        if (_options.IsConfigured)
        {
            try
            {
                var config = new AmazonS3Config
                {
                    ServiceURL = _options.GetServiceUrl(),
                    ForcePathStyle = _options.ForcePathStyle,
                    AuthenticationRegion = "auto"
                };

                var credentials = new BasicAWSCredentials(_options.AccessKeyId, _options.SecretAccessKey);
                _s3Client = new AmazonS3Client(credentials, config);
                _logger.LogInformation("Cloudflare R2 (S3) client initialized successfully for bucket '{BucketName}'.", _options.BucketName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize Cloudflare R2 (S3) client.");
                _s3Client = null;
            }
        }
        else
        {
            _logger.LogInformation("Cloudflare R2 is not fully configured; image storage will fall back to local/database.");
        }
    }

    public async Task<string> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        string? folder = null,
        CancellationToken cancellationToken = default)
    {
        if (!IsConfigured || _s3Client == null)
        {
            throw new InvalidOperationException("Cloudflare R2 is not configured.");
        }

        var key = BuildKey(fileName, folder);
        var resolvedContentType = ResolveContentType(fileName, contentType);

        var putRequest = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = key,
            InputStream = stream,
            ContentType = resolvedContentType,
            DisablePayloadSigning = true
        };

        await _s3Client.PutObjectAsync(putRequest, cancellationToken);
        var publicUrl = GetPublicUrl(key);
        _logger.LogInformation("Uploaded file {Key} to Cloudflare R2. Public URL: {Url}", key, publicUrl);
        return publicUrl;
    }

    public async Task<string> UploadAsync(
        byte[] data,
        string fileName,
        string contentType,
        string? folder = null,
        CancellationToken cancellationToken = default)
    {
        using var stream = new MemoryStream(data);
        return await UploadAsync(stream, fileName, contentType, folder, cancellationToken);
    }

    public async Task<string> UploadFileAsync(
        IFormFile file,
        string? folder = null,
        CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File cannot be null or empty.", nameof(file));
        }

        using var stream = file.OpenReadStream();
        return await UploadAsync(stream, file.FileName, file.ContentType, folder, cancellationToken);
    }

    public async Task<(Stream Stream, string ContentType)?> DownloadAsync(
        string keyOrUrl,
        CancellationToken cancellationToken = default)
    {
        if (!IsConfigured || _s3Client == null)
        {
            return null;
        }

        var key = ExtractKey(keyOrUrl);
        try
        {
            var getRequest = new GetObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key
            };

            var response = await _s3Client.GetObjectAsync(getRequest, cancellationToken);
            var memoryStream = new MemoryStream();
            await response.ResponseStream.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;

            return (memoryStream, response.Headers.ContentType ?? "application/octet-stream");
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            _logger.LogWarning("File with key {Key} not found in Cloudflare R2.", key);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file {Key} from Cloudflare R2.", key);
            return null;
        }
    }

    public async Task<bool> DeleteAsync(string keyOrUrl, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured || _s3Client == null)
        {
            return false;
        }

        var key = ExtractKey(keyOrUrl);
        try
        {
            var deleteRequest = new DeleteObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key
            };

            await _s3Client.DeleteObjectAsync(deleteRequest, cancellationToken);
            _logger.LogInformation("Deleted file {Key} from Cloudflare R2.", key);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file {Key} from Cloudflare R2.", key);
            return false;
        }
    }

    public string GetPublicUrl(string key)
    {
        var cleanKey = key.TrimStart('/');
        if (!string.IsNullOrWhiteSpace(_options.PublicUrl))
        {
            return $"{_options.PublicUrl.TrimEnd('/')}/{cleanKey}";
        }

        return $"{_options.GetServiceUrl().TrimEnd('/')}/{_options.BucketName}/{cleanKey}";
    }

    public string ExtractKey(string keyOrUrl)
    {
        if (string.IsNullOrWhiteSpace(keyOrUrl))
        {
            return string.Empty;
        }

        if (Uri.TryCreate(keyOrUrl, UriKind.Absolute, out var uri))
        {
            var path = uri.AbsolutePath.TrimStart('/');
            if (!string.IsNullOrEmpty(_options.BucketName) && path.StartsWith(_options.BucketName + "/", StringComparison.OrdinalIgnoreCase))
            {
                path = path.Substring(_options.BucketName.Length + 1);
            }
            return path;
        }

        return keyOrUrl.TrimStart('/');
    }

    private static string BuildKey(string fileName, string? folder)
    {
        var safeFileName = Path.GetFileName(fileName);
        var extension = Path.GetExtension(safeFileName);
        var nameWithoutExt = Path.GetFileNameWithoutExtension(safeFileName);

        // Sanitize name
        var cleanName = string.Concat(nameWithoutExt.Select(c => char.IsLetterOrDigit(c) ? c : '_')).Trim('_');
        if (string.IsNullOrWhiteSpace(cleanName))
        {
            cleanName = "file";
        }

        var uniqueFileName = $"{Guid.NewGuid():N}_{cleanName}{extension}";
        if (string.IsNullOrWhiteSpace(folder))
        {
            return uniqueFileName;
        }

        var cleanFolder = folder.Trim().Trim('/').Replace('\\', '/');
        return $"{cleanFolder}/{uniqueFileName}";
    }

    private static string ResolveContentType(string fileName, string? providedContentType)
    {
        if (!string.IsNullOrWhiteSpace(providedContentType) &&
            !providedContentType.Equals("application/octet-stream", StringComparison.OrdinalIgnoreCase))
        {
            return providedContentType;
        }

        var ext = Path.GetExtension(fileName)?.ToLowerInvariant();
        return ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            ".svg" => "image/svg+xml",
            ".bmp" => "image/bmp",
            _ => "application/octet-stream"
        };
    }

    public void Dispose()
    {
        _s3Client?.Dispose();
    }
}
