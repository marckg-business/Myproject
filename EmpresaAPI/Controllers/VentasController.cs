using Microsoft.AspNetCore.Mvc;
using EmpresaAPI.Services;
using EmpresaAPI.Models.Dtos;

[ApiController]
[Route("api/[controller]")]
public class VentasController : ControllerBase
{
    private readonly VentaService _service;

    public VentasController(VentaService service)
    {
        _service = service;
    }

    [HttpPost]
    public IActionResult RegistrarVenta([FromBody] VentaCreateDto venta)
    {
        var ventaId = _service.RegistrarVenta(venta);
        return Ok(new { Message = "Venta registrada", VentaId = ventaId });
    }
}
