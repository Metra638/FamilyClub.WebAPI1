using Microsoft.AspNetCore.Http;

namespace FamilyClub.BLL.Interfaces;

public interface IStorageService
{
    /// <summary>
    /// Indicates whether cloud storage credentials are configured.
    /// </summary>
    bool IsConfigured { get; }

    /// <summary>
    /// Uploads a stream to storage and returns its URL.
    /// </summary>
    Task<string> UploadAsync(Stream stream, string fileName, string contentType, string? folder = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Uploads a byte array to storage and returns its URL.
    /// </summary>
    Task<string> UploadAsync(byte[] data, string fileName, string contentType, string? folder = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Uploads an IFormFile to storage and returns its URL.
    /// </summary>
    Task<string> UploadFileAsync(IFormFile file, string? folder = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads an object from storage as a stream with its content type.
    /// </summary>
    Task<(Stream Stream, string ContentType)?> DownloadAsync(string keyOrUrl, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an object from storage by key or full URL.
    /// </summary>
    Task<bool> DeleteAsync(string keyOrUrl, CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates the public URL for an object key.
    /// </summary>
    string GetPublicUrl(string key);

    /// <summary>
    /// Extracts the storage key from a key or full URL.
    /// </summary>
    string ExtractKey(string keyOrUrl);
}

