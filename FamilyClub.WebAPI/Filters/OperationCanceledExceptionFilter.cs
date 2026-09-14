using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FamilyClub.WebAPI.Filters;

/// <summary>
/// Глобальний фільтр винятків для коректного перехоплення скасування клієнтських запитів.
/// Запобігає зупинці дебагера Visual Studio та реєстрації помилок 500 при штатному відключенні клієнта.
/// </summary>
public class OperationCanceledExceptionFilter : IExceptionFilter
{
    private readonly ILogger<OperationCanceledExceptionFilter> _logger;

    public OperationCanceledExceptionFilter(ILogger<OperationCanceledExceptionFilter> logger)
    {
        _logger = logger;
    }

    public void OnException(ExceptionContext context)
    {
        if (context.Exception is OperationCanceledException || context.Exception.InnerException is OperationCanceledException)
        {
            _logger.LogInformation("HTTP запит {Method} {Path} був скасований клієнтом.", context.HttpContext.Request.Method, context.HttpContext.Request.Path);
            context.ExceptionHandled = true;
            context.Result = new StatusCodeResult(499); // Client Closed Request
        }
    }
}
