using System;
using System.Collections.Generic;
using System.Text;

namespace FamilyClub.BLL.DTOs.OrderItem
{
	public class OrderItemDTO
	{
		public int Id { get; set; }

		public int Quantity { get; set; }

		public decimal UnitPrice { get; set; }
        public int ProductId { get; set; }//FK
		public int OrderId { get; set; }   //FK
	}
}
