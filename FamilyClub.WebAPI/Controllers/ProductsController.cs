using FamilyClub.BLL.DTOs.Product;
using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FamilyClub.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll(CancellationToken cancellationToken)
    {
        var products = await _productService.GetAllAsync(cancellationToken);
        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var product = await _productService.GetByIdAsync(id, cancellationToken);
        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] ProductDto dto, [FromForm] List<IFormFile> productImageFiles, CancellationToken cancellationToken)
    {
        if (productImageFiles.Count > 5) { 
            return BadRequest("You can upload a maximum of 5 images.");
        }
        var createdProduct = await _productService.CreateAsync(dto, productImageFiles , cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = createdProduct.Id }, createdProduct);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] ProductDto dto, [FromForm] List<IFormFile> productImageFiles, CancellationToken cancellationToken)
    {
        if (productImageFiles.Count > 5)
        {
            return BadRequest("You can upload a maximum of 5 images.");
        }
        var updated = await _productService.UpdateAsync(id, dto, productImageFiles, cancellationToken);
        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await _productService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}