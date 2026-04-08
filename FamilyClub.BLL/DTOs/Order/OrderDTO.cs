using FamilyClub.BLL.DTOs.OrderItem;
using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.BLL.DTOs.Order
{
	public class OrderDTO
	{
		public int Id { get; set; }

		public int UserId { get; set; }
		public DateTime OrderDate { get; set; } 

		public string Status { get; set; } = "Pending";

		public decimal TotalPrice { get; set; }

		public List<OrderItemDTO> OrderItems { get; set; } = new();
	}
}
