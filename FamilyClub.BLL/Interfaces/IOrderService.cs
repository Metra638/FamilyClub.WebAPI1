using FamilyClub.BLL.DTOs.Order;
using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.BLL.Interfaces
{
	public interface IOrderService
	{
		Task<IEnumerable<OrderDTO>> GetAllAsync(CancellationToken cancellationToken = default);
		Task<OrderDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
		Task<OrderDTO> CreateAsync(OrderDTO dto, CancellationToken cancellationToken = default);
		Task<bool> UpdateAsync(int id, OrderDTO dto, CancellationToken cancellationToken = default);
		Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
	}
}
