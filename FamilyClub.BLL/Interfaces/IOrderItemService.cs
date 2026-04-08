using FamilyClub.BLL.DTOs.Order;
using FamilyClub.BLL.DTOs.OrderItem;
using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.BLL.Interfaces
{
	public interface IOrderItemService
	{
		Task<IEnumerable<OrderItemDTO>> GetAllAsync(CancellationToken cancellationToken = default);
		Task<OrderItemDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
		Task<OrderItemDTO> CreateAsync(OrderItemDTO dto, CancellationToken cancellationToken = default);
		Task<bool> UpdateAsync(int id, OrderItemDTO dto, CancellationToken cancellationToken = default);
		Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
	}
}
