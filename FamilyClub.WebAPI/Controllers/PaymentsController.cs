using FamilyClub.BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe.Checkout;
using System.Security.Claims;
using Stripe;  // для EventUtility / Event

namespace FamilyClub.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PaymentsController : ControllerBase
{
    private static readonly HashSet<string> SupportedCurrencies = new(StringComparer.OrdinalIgnoreCase)
    {
        "uah",
        "usd",
    };

    private readonly IOrderService _orderService;
    private readonly IConfiguration _config;

    public PaymentsController(IOrderService orderService, IConfiguration config)
    {
        _orderService = orderService;
        _config = config;
    }

    /// <summary>
    /// Currency і locale передає фронт. За замовчуванням — uah / uk.
    /// TotalPrice замовлення має вже бути в цій валюті (без конвертації на бекенді).
    /// </summary>
    public record CheckoutSessionRequest(int OrderId, string? Currency = null, string? Locale = null);

    [HttpPost("checkout-session")]
    public async Task<IActionResult> CreateCheckoutSession(
        [FromBody] CheckoutSessionRequest request,
        CancellationToken ct)
    {
        var order = await _orderService.GetByIdAsync(request.OrderId, ct);
        if (order is null)
        {
            return NotFound("Order not found");
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");

        if (userId is null || order.UserId != userId)
        {
            return Forbid();
        }

        if (string.Equals(order.Status, "Paid", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Order already paid");
        }

        var currency = string.IsNullOrWhiteSpace(request.Currency)
            ? "uah"
            : request.Currency.Trim().ToLowerInvariant();

        if (!SupportedCurrencies.Contains(currency))
        {
            return BadRequest("Supported currencies: uah, usd");
        }

        var locale = string.IsNullOrWhiteSpace(request.Locale)
            ? "uk"
            : request.Locale.Trim().ToLowerInvariant();
        if (locale is not ("uk" or "en"))
        {
            locale = "uk";
        }

        // Сума вже в обраній валюті (фронт відповідає за це)
        var unitAmount = (long)Math.Round(order.TotalPrice * 100m, MidpointRounding.AwayFromZero);
        if (unitAmount < 1)
        {
            return BadRequest("Amount must be at least 1 minor unit");
        }

        var frontendBase = (_config["Frontend:BaseUrl"] ?? "http://localhost:3000").TrimEnd('/');

        var options = new SessionCreateOptions
        {
            Mode = "payment",
            SuccessUrl = $"{frontendBase}/{locale}/checkout/success?orderId={order.Id}&session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = $"{frontendBase}/{locale}/checkout/cancel?orderId={order.Id}",
            LineItems =
            [
                new SessionLineItemOptions
                {
                    Quantity = 1,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = currency,
                        UnitAmount = unitAmount,
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = $"Order #{order.Id}",
                        },
                    },
                },
            ],
            Metadata = new Dictionary<string, string>
            {
                ["orderId"] = order.Id.ToString(),
                ["currency"] = currency,
                ["locale"] = locale,
            },
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options, cancellationToken: ct);

        return Ok(new
        {
            url = session.Url,
            sessionId = session.Id,
            currency,
            amount = order.TotalPrice,
        });
    }
    
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook(CancellationToken ct)
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync(ct);
        var signature = Request.Headers["Stripe-Signature"].ToString();
        var webhookSecret = _config["Stripe:WebhookSecret"];
        if (string.IsNullOrWhiteSpace(webhookSecret))
        {
            return StatusCode(500, "Webhook secret is not configured");
        }
        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(json, signature, webhookSecret);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Stripe webhook signature error: {ex.Message}");
            return BadRequest();
        }
        if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
        {
            var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
            if (session?.Metadata != null &&
                session.Metadata.TryGetValue("orderId", out var orderIdRaw) &&
                int.TryParse(orderIdRaw, out var orderId))
            {
                await _orderService.UpdateAsync(
                    orderId,
                    new FamilyClub.BLL.DTOs.Order.OrderDTO
                    {
                        Status = "Paid",
                    },
                    ct);
            }
        }
        return Ok();
    }
}

