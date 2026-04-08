using FamilyClub.BLL.DTOs.Order;
using FamilyClub.BLL.Interfaces;
using FamilyClub.BLL.Services;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

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

		// GET: api/<OrdersController>
		[HttpGet]
		public async Task<ActionResult<IEnumerable<OrderDTO>>> GetAll(CancellationToken cancellationToken)
		{
			var orders = await _orderService.GetAllAsync(cancellationToken);
			return Ok(orders);
		}

		// GET api/<OrdersController>/5
		[HttpGet("{id:int}")]
		public async Task<ActionResult<OrderDTO>> GetById(int id, CancellationToken cancellationToken)
		{
			var order = await _orderService.GetByIdAsync(id, cancellationToken);
			if (order is null)
			{
				return NotFound();
			}

			return Ok(order);
		}

		// POST api/<OrdersController>
		[HttpPost]
		public async Task<IActionResult> Create([FromBody] OrderDTO dto, CancellationToken cancellationToken)
		{
			var createdOrder = await _orderService.CreateAsync(dto, cancellationToken);
			return CreatedAtAction(nameof(GetById), new { id = createdOrder.Id }, createdOrder);
		}

		// PUT api/<OrdersController>/5
		[HttpPut("{id:int}")]
		public async Task<IActionResult> Update(int id, [FromBody] OrderDTO dto, CancellationToken cancellationToken)
		{
			var updated = await _orderService.UpdateAsync(id, dto, cancellationToken);
			if (!updated)
			{
				return NotFound();
			}

			return NoContent();
		}

		// DELETE api/<OrdersController>/5
		[HttpDelete("{id:int}")]
		public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
		{
			var deleted = await _orderService.DeleteAsync(id, cancellationToken);
			if (!deleted)
			{
				return NotFound();
			}

			return NoContent();
		}
	}
}
