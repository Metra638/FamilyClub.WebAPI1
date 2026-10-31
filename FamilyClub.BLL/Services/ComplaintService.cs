using FamilyClub.BLL.DTOs.Complaint;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace FamilyClub.BLL.Services
{
    public class ComplaintService : IComplaintsService
    {
        private const int MAX_IMAGES = 5;
        private readonly IComplaintRepository _complaintRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStorageService _storageService;

        public ComplaintService(
            IComplaintRepository complaintRepository,
            IUnitOfWork unitOfWork,
            IStorageService storageService)
        {
            _complaintRepository = complaintRepository;
            _unitOfWork = unitOfWork;
            _storageService = storageService;
        }

        public async Task<IEnumerable<ComplaintsReadDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var complaints = await _complaintRepository.GetAllAsync(cancellationToken);
            return complaints.Select(MapToReadDto);
        }

        public async Task<ComplaintsReadDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var complaint = await _complaintRepository.GetByIdAsync(id, cancellationToken);
            return complaint is null ? null : MapToReadDto(complaint);
        }

        public async Task<ComplaintsReadDto> CreateAsync(ComplaintsCreateDto dto, CancellationToken cancellationToken = default)
        {
            // Validate image count
            if (dto.Images != null && dto.Images.Count > MAX_IMAGES)
            {
                throw new InvalidOperationException($"Cannot attach more than {MAX_IMAGES} images to a complaint.");
            }

            var complaint = new Complaint
            {
                ComplaintText = dto.ComplaintText,
                ComplaintType = dto.ComplaintType,
                ClubMemberId = dto.ClubMemberId,
                IsResolved = false,
                CreatedAt = DateTime.UtcNow,
                ResolvedAt = null,
                ResolutionNotes = null
            };

            // Add images if provided
            if (dto.Images != null && dto.Images.Any())
            {
                foreach (var imageDto in dto.Images)
                {
                    string? imageUrl = imageDto.ImageUrl;
                    string? storageKey = null;
                    byte[]? imgData = imageDto.ImageData;

                    if (_storageService.IsConfigured && imgData != null && imgData.Length > 0 && string.IsNullOrEmpty(imageUrl))
                    {
                        try
                        {
                            imageUrl = await _storageService.UploadAsync(imgData, imageDto.ImageName, imageDto.ContentType ?? "image/jpeg", "complaints", cancellationToken);
                            storageKey = _storageService.ExtractKey(imageUrl);
                            imgData = Array.Empty<byte>();
                        }
                        catch
                        {
                            // fallback to database
                        }
                    }

                    var complaintImage = new ComplaintImage
                    {
                        ImageData = imgData,
                        ImageName = imageDto.ImageName,
                        ContentType = imageDto.ContentType,
                        ImageUrl = imageUrl,
                        StorageKey = storageKey,
                        UploadedAt = DateTime.UtcNow
                    };
                    complaint.ComplaintImages.Add(complaintImage);
                }
            }

            await _complaintRepository.AddAsync(complaint, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return MapToReadDto(complaint);
        }

        public async Task<bool> UpdateAsync(int id, ComplaintsReadDto dto, CancellationToken cancellationToken = default)
        {
            var complaint = await _complaintRepository.GetByIdAsync(id, cancellationToken);
            if (complaint is null)
            {
                return false;
            }

            // Оновлюємо поля бізнес-логіки
            complaint.ComplaintText = dto.ComplaintText;
            complaint.ComplaintType = dto.ComplaintType;
            complaint.ResolutionNotes = dto.ResolutionNotes;

            // Логіка автоматичного виставлення дати вирішення скарги
            if (dto.IsResolved && !complaint.IsResolved)
            {
                complaint.IsResolved = true;
                complaint.ResolvedAt = DateTime.UtcNow;
            }
            else if (!dto.IsResolved && complaint.IsResolved)
            {
                complaint.IsResolved = false;
                complaint.ResolvedAt = null;
            }

            _complaintRepository.Update(complaint);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var complaint = await _complaintRepository.GetByIdAsync(id, cancellationToken);
            if (complaint is null)
            {
                return false;
            }

            if (complaint.ComplaintImages != null)
            {
                foreach (var img in complaint.ComplaintImages)
                {
                    var key = img.StorageKey ?? img.ImageUrl;
                    if (!string.IsNullOrWhiteSpace(key))
                    {
                        await _storageService.DeleteAsync(key, cancellationToken);
                    }
                }
            }

            _complaintRepository.Delete(complaint);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<IEnumerable<ComplaintsReadDto>> GetByClubMemberIdAsync(string clubMemberId, CancellationToken cancellationToken = default)
        {
            var complaints = await _complaintRepository.GetByClubMemberIdAsync(clubMemberId, cancellationToken);
            return complaints.Select(MapToReadDto);
        }

        // Image management methods
        public async Task<ComplaintImageDto> AddImageToComplaintAsync(int complaintId, ComplaintImageCreateDto imageDto, CancellationToken cancellationToken = default)
        {
            var complaint = await _complaintRepository.GetByIdAsync(complaintId, cancellationToken);

            if (complaint == null)
                throw new InvalidOperationException($"Complaint with ID {complaintId} not found.");

            if (complaint.ComplaintImages.Count >= MAX_IMAGES)
                throw new InvalidOperationException($"Cannot add more than {MAX_IMAGES} images to a complaint.");

            string? imageUrl = imageDto.ImageUrl;
            string? storageKey = null;
            byte[]? imgData = imageDto.ImageData;

            if (_storageService.IsConfigured && imgData != null && imgData.Length > 0 && string.IsNullOrEmpty(imageUrl))
            {
                try
                {
                    imageUrl = await _storageService.UploadAsync(imgData, imageDto.ImageName, imageDto.ContentType ?? "image/jpeg", "complaints", cancellationToken);
                    storageKey = _storageService.ExtractKey(imageUrl);
                    imgData = Array.Empty<byte>();
                }
                catch
                {
                    // fallback to database
                }
            }

            var complaintImage = new ComplaintImage
            {
                ImageData = imgData,
                ImageName = imageDto.ImageName,
                ContentType = imageDto.ContentType,
                ImageUrl = imageUrl,
                StorageKey = storageKey,
                ComplaintId = complaintId,
                UploadedAt = DateTime.UtcNow
            };

            complaint.ComplaintImages.Add(complaintImage);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return MapToImageDto(complaintImage);
        }

        public async Task<bool> RemoveImageFromComplaintAsync(int complaintId, int imageId, CancellationToken cancellationToken = default)
        {
            var complaint = await _complaintRepository.GetByIdAsync(complaintId, cancellationToken);

            if (complaint == null)
                return false;

            var image = complaint.ComplaintImages.FirstOrDefault(img => img.Id == imageId);
            if (image == null)
                return false;

            var key = image.StorageKey ?? image.ImageUrl;
            if (!string.IsNullOrWhiteSpace(key))
            {
                await _storageService.DeleteAsync(key, cancellationToken);
            }

            complaint.ComplaintImages.Remove(image);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<IEnumerable<ComplaintImageDto>> GetComplaintImagesAsync(int complaintId, CancellationToken cancellationToken = default)
        {
            var complaint = await _complaintRepository.GetByIdAsync(complaintId, cancellationToken);

            if (complaint == null)
                return Enumerable.Empty<ComplaintImageDto>();

            return complaint.ComplaintImages.Select(MapToImageDto);
        }

        // Мапінг з Entity в Read DTO
        private static ComplaintsReadDto MapToReadDto(Complaint complaint)
        {
            return new ComplaintsReadDto
            {
                Id = complaint.Id,
                ComplaintText = complaint.ComplaintText,
                ComplaintType = complaint.ComplaintType,
                IsResolved = complaint.IsResolved,
                CreatedAt = complaint.CreatedAt,
                ResolvedAt = complaint.ResolvedAt,
                ClubMemberId = complaint.ClubMemberId,
                ResolutionNotes = complaint.ResolutionNotes,
                Images = complaint.ComplaintImages?.Select(MapToImageDto).ToList() ?? new List<ComplaintImageDto>()
            };
        }

        private static ComplaintImageDto MapToImageDto(ComplaintImage image)
        {
            return new ComplaintImageDto
            {
                Id = image.Id,
                ImageName = image.ImageName,
                ContentType = image.ContentType,
                UploadedAt = image.UploadedAt,
                ImageData = image.ImageData,
                ImageUrl = image.ImageUrl
            };
        }
    }
}
