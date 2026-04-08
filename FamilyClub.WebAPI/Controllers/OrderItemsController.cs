using FamilyClub.BLL.DTOs.OrderItem;
using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FamilyClub.WebAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class OrderItemsController : ControllerBase
	{
		private readonly IOrderItemService _orderItemService;

		public OrderItemsController(IOrderItemService orderItemService)
		{
			_orderItemService = orderItemService;
		}

		// GET: api/<OrderItemsController>
		[HttpGet]
		public async Task<ActionResult<IEnumerable<OrderItemDTO>>> GetAll(CancellationToken cancellationToken)
		{
			var ordersItems = await _orderItemService.GetAllAsync(cancellationToken);
			return Ok(ordersItems);
		}

		// GET api/<OrderItemsController>/5
		[HttpGet("{id:int}")]
		public async Task<ActionResult<OrderItemDTO>> GetById(int id, CancellationToken cancellationToken)
		{
			var orderItem = await _orderItemService.GetByIdAsync(id, cancellationToken);
			if (orderItem is null)
			{
				return NotFound();
			}

			return Ok(orderItem);
		}

		// POST api/<OrderItemsController>
		[HttpPost]
		public async Task<IActionResult> Create([FromBody] OrderItemDTO dto, CancellationToken cancellationToken)
		{
			var createdOrderItem = await _orderItemService.CreateAsync(dto, cancellationToken);
			return CreatedAtAction(nameof(GetById), new { id = createdOrderItem.Id }, createdOrderItem);
		}

		// PUT api/<OrderItemsController>/5
		[HttpPut("{id:int}")]
		public async Task<IActionResult> Update(int id, [FromBody] OrderItemDTO dto, CancellationToken cancellationToken)
		{
			var updated = await _orderItemService.UpdateAsync(id, dto, cancellationToken);
			if (!updated)
			{
				return NotFound();
			}

			return NoContent();
		}

		// DELETE api/<OrderItemsController>/5
		[HttpDelete("{id:int}")]
		public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
		{
			var deleted = await _orderItemService.DeleteAsync(id, cancellationToken);
			if (!deleted)
			{
				return NotFound();
			}

			return NoContent();
		}
	}
}
