using FamilyClub.BLL.DTOs.Order;
using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamilyClub.WebAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class OrdersController : ControllerBase
	{
		private readonly IOrderService _orderService;

		public OrdersController(IOrderService orderService)
		{
			_orderService = orderService;
		}

		[HttpGet]
		[Authorize(Roles = "Admin,Manager")]
		public async Task<ActionResult<IEnumerable<OrderDTO>>> GetAll(CancellationToken cancellationToken)
		{
			var orders = await _orderService.GetAllAsync(cancellationToken);
			return Ok(orders);
		}

		[HttpGet("{id:int}")]
		[Authorize]
		public async Task<ActionResult<OrderDTO>> GetById(int id, CancellationToken cancellationToken)
		{
			var order = await _orderService.GetByIdAsync(id, cancellationToken);
			if (order is null)
			{
				return NotFound();
			}

			return Ok(order);
		}

		[HttpPost]
		[Authorize]
		public async Task<IActionResult> Create([FromBody] OrderDTO dto, CancellationToken cancellationToken)
		{
			var createdOrder = await _orderService.CreateAsync(dto, cancellationToken);
			return CreatedAtAction(nameof(GetById), new { id = createdOrder.Id }, createdOrder);
		}

		[HttpPut("{id:int}")]
		[Authorize(Roles = "Admin,Manager")]
		public async Task<IActionResult> Update(int id, [FromBody] OrderDTO dto, CancellationToken cancellationToken)
		{
			var updated = await _orderService.UpdateAsync(id, dto, cancellationToken);
			if (!updated)
			{
				return NotFound();
			}

			return NoContent();
		}

		[HttpDelete("{id:int}")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
		{
			var deleted = await _orderService.DeleteAsync(id, cancellationToken);
			if (!deleted)
			{
				return NotFound();
			}

			return NoContent();
		}

        [HttpGet("by-user/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetByUserId(string userId, CancellationToken cancellationToken)
        {
            try
            {
                var orders = await _orderService.GetByUserIdAsync(userId, cancellationToken);
                return Ok(orders);
            }
            catch (OperationCanceledException)
            {
                return Ok(Array.Empty<OrderDTO>());
            }
        }
    }
}
