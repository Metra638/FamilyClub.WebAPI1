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
			var orders = await _orderRepository.GetAllAsync(cancellationToken);
			return orders.Select(MapToReadDto);
		}

		public async Task<OrderDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
		{
			var order = await _orderRepository.GetByIdAsync(id, cancellationToken);
			return order is null ? null : MapToReadDto(order);
		}

		public async Task<OrderDTO> CreateAsync(OrderDTO dto, CancellationToken cancellationToken = default)
		{
			var order = new Order
			{
				UserId = dto.UserId,
				OrderDate = DateTime.UtcNow,
				Status = dto.Status,
				PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod)
					? "card_online"
					: dto.PaymentMethod.Trim(),
				TotalPrice = dto.TotalPrice,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                DeliveryProvider = dto.DeliveryProvider,
                DeliveryType = dto.DeliveryType,
                City = dto.City,
                CityRef = dto.CityRef,
                Branch = dto.Branch,
                BranchRef = dto.BranchRef,
                DeliveryCost = dto.DeliveryCost,

                Comment = dto.Comment,

                OrderItems = dto.OrderItems.Select(item => new OrderItem
				{
					ProductId = item.ProductId, // FK
					Quantity = item.Quantity,
					UnitPrice = item.UnitPrice,
					Format = item.Format,
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

			if (!string.IsNullOrEmpty(dto.UserId))
			{
				order.UserId = dto.UserId;
			}
			if (!string.IsNullOrEmpty(dto.Status))
			{
				order.Status = dto.Status;
			}
			if (!string.IsNullOrWhiteSpace(dto.PaymentMethod))
			{
				order.PaymentMethod = dto.PaymentMethod.Trim();
			}
			if (dto.TotalPrice > 0)
			{
				order.TotalPrice = dto.TotalPrice;
			}
            if (dto.FirstName != null) order.FirstName = dto.FirstName;
            if (dto.LastName != null) order.LastName = dto.LastName;
            if (dto.Email != null) order.Email = dto.Email;
            if (dto.Phone != null) order.Phone = dto.Phone;
            if (dto.DeliveryProvider != null) order.DeliveryProvider = dto.DeliveryProvider;
            if (dto.DeliveryType != null) order.DeliveryType = dto.DeliveryType;
            if (dto.City != null) order.City = dto.City;
            if (dto.CityRef != null) order.CityRef = dto.CityRef;
            if (dto.Branch != null) order.Branch = dto.Branch;
            if (dto.BranchRef != null) order.BranchRef = dto.BranchRef;
            if (dto.DeliveryCost.HasValue) order.DeliveryCost = dto.DeliveryCost;

            if (dto.Comment != null) order.Comment = dto.Comment;

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
        public async Task<IEnumerable<OrderDTO>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
        {
            var orders = await _orderRepository.GetByUserIdAsync(userId, cancellationToken);
            return orders.Select(MapToReadDto);
        }
        private static OrderDTO MapToReadDto(Order order)
		{
			return new OrderDTO
			{
				Id = order.Id,
				UserId = order.UserId,
                UserName = order.ClubMember != null
            ? $"{order.ClubMember.Name} {order.ClubMember.Surname}".Trim()
            : order.UserId,
                OrderDate = order.OrderDate,
				Status = order.Status,
				PaymentMethod = order.PaymentMethod,
				TotalPrice = order.TotalPrice,

                FirstName = order.FirstName,
                LastName = order.LastName,
                Email = order.Email,
                Phone = order.Phone,
                DeliveryProvider = order.DeliveryProvider,
                DeliveryType = order.DeliveryType,
                City = order.City,
                CityRef = order.CityRef,
                Branch = order.Branch,
                BranchRef = order.BranchRef,
                DeliveryCost = order.DeliveryCost,

                Comment = order.Comment,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDTO
				{
					Id = oi.Id,
					Quantity = oi.Quantity,
					UnitPrice = oi.UnitPrice,
					ProductId = oi.ProductId,
                    ProductName = oi.Product?.ProductName,
                    OrderId = oi.OrderId,
                    Format = oi.Format
                }).ToList()
			};
		}
	}
}
