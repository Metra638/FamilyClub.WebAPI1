using FamilyClub.BLL.DTOs.OrderItem;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.BLL.Services
{
	public class OrderItemService : IOrderItemService
	{
		private readonly IOrderItemRepository _orderItemRepository;
		private readonly IUnitOfWork _unitOfWork;

		public OrderItemService(IOrderItemRepository orderItemRepository, IUnitOfWork unitOfWork)
		{
			_orderItemRepository = orderItemRepository;
			_unitOfWork = unitOfWork;
		}

		public async Task<IEnumerable<OrderItemDTO>> GetAllAsync(CancellationToken cancellationToken = default)
		{
			var ordersItems = await _orderItemRepository.GetAllAsync(cancellationToken);
			return ordersItems.Select(MapToReadDto);
		}

		public async Task<OrderItemDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
		{
			var orderItem = await _orderItemRepository.GetByIdAsync(id, cancellationToken);
			return orderItem is null ? null : MapToReadDto(orderItem);
		}

		public async Task<OrderItemDTO> CreateAsync(OrderItemDTO dto, CancellationToken cancellationToken = default)
		{
			var orderItem = new OrderItem
			{
				Quantity = dto.Quantity,
				UnitPrice = dto.UnitPrice,
				ProductId = dto.ProductId,
			};

			await _orderItemRepository.AddAsync(orderItem, cancellationToken);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return MapToReadDto(orderItem);
		}

		public async Task<bool> UpdateAsync(int id, OrderItemDTO dto, CancellationToken cancellationToken = default)
		{
			var orderItem = await _orderItemRepository.GetByIdAsync(id, cancellationToken);
			if (orderItem is null)
			{
				return false;
			}

			orderItem.Quantity = dto.Quantity;
			orderItem.UnitPrice = dto.UnitPrice;
			orderItem.ProductId = dto.ProductId;

			_orderItemRepository.Update(orderItem);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return true;
		}

		public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
		{
			var orderItem = await _orderItemRepository.GetByIdAsync(id, cancellationToken);
			if (orderItem is null)
			{
				return false;
			}

			_orderItemRepository.Delete(orderItem);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return true;
		}

		private static OrderItemDTO MapToReadDto(OrderItem orderItem)
		{
			return new OrderItemDTO
			{
				Id = orderItem.Id,
				Quantity = orderItem.Quantity,
				UnitPrice = orderItem.UnitPrice,
				ProductId = orderItem.ProductId,
				OrderId = orderItem.OrderId
			};
		}
	}
}
