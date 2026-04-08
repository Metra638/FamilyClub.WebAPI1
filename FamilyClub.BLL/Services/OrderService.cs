using FamilyClub.BLL.DTOs.Order;
using FamilyClub.BLL.DTOs.OrderItem;
using FamilyClub.BLL.Interfaces;
using FamilyClub.DAL.Interfaces;
using FamilyClubLibrary;
using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.BLL.Services
{
	public class OrderService : IOrderService
	{
		private readonly IOrderRepository _orderRepository;
		private readonly IUnitOfWork _unitOfWork;

		public OrderService(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
		{
			_orderRepository = orderRepository;
			_unitOfWork = unitOfWork;
		}

		public async Task<IEnumerable<OrderDTO>> GetAllAsync(CancellationToken cancellationToken = default)
		{
			var orders = await _orderRepository.GetAllWithItemsAsync(cancellationToken);
			return orders.Select(MapToReadDto);
		}

		public async Task<OrderDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
		{
			var order = await _orderRepository.GetByIdWithItemsAsync(id, cancellationToken);
			return order is null ? null : MapToReadDto(order);
		}

		public async Task<OrderDTO> CreateAsync(OrderDTO dto, CancellationToken cancellationToken = default)
		{
			var order = new Order
			{
				UserId = dto.UserId,
				OrderDate = DateTime.UtcNow,
				Status = dto.Status,
				TotalPrice = dto.TotalPrice,
				OrderItems = dto.OrderItems.Select(item => new OrderItem
				{
					ProductId = item.ProductId, // FK
					Quantity = item.Quantity,
					UnitPrice = item.UnitPrice,
				}).ToList()
			};

			await _orderRepository.AddAsync(order, cancellationToken);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return MapToReadDto(order);
		}

		public async Task<bool> UpdateAsync(int id, OrderDTO dto, CancellationToken cancellationToken = default)
		{
			var order = await _orderRepository.GetByIdAsync(id, cancellationToken);
			if (order is null)
			{
				return false;
			}

			order.UserId = dto.UserId;
			order.Status = dto.Status;
			order.TotalPrice = dto.TotalPrice;

			_orderRepository.Update(order);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return true;
		}

		public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
		{
			var order = await _orderRepository.GetByIdAsync(id, cancellationToken);
			if (order is null)
			{
				return false;
			}

			_orderRepository.Delete(order);
			await _unitOfWork.SaveChangesAsync(cancellationToken);

			return true;
		}

		private static OrderDTO MapToReadDto(Order order)
		{
			return new OrderDTO
			{
				Id = order.Id,
				UserId = order.UserId,
				OrderDate = order.OrderDate,
				Status = order.Status,
				TotalPrice = order.TotalPrice,
				OrderItems = order.OrderItems.Select(oi => new OrderItemDTO
				{
					Id = oi.Id,
					Quantity = oi.Quantity,
					UnitPrice = oi.UnitPrice,
					ProductId = oi.ProductId,
					OrderId = oi.OrderId
				}).ToList()
			};
		}
	}
}
