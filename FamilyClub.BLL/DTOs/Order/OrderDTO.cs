using FamilyClub.BLL.DTOs.OrderItem;
using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.BLL.DTOs.Order
{
	public class OrderDTO
	{
		public int Id { get; set; }

		public string UserId { get; set; } = default!;
        public string? UserName { get; set; }
        public DateTime OrderDate { get; set; } 

		public string Status { get; set; } = "Pending";

		/// <summary>
		/// card_online | cash_on_delivery | card_dia (reserved)
		/// </summary>
		public string PaymentMethod { get; set; } = "card_online";

		public decimal TotalPrice { get; set; }

		public List<OrderItemDTO> OrderItems { get; set; } = new();
	}
}
