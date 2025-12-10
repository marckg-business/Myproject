using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

[ApiController]
[Route("api/[controller]")]
public class HistorialVentasController : ControllerBase
{
    private readonly string _connectionString;

    public HistorialVentasController(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection");
    }

    [HttpGet("cliente/{clienteId}")]
    public async Task<IActionResult> GetHistorialPorCliente(int clienteId)
    {
        
        const string query = @"
            SELECT 
                v.Id,
                v.Fecha,
                p.Nombre,
                dv.Cantidad,
                dv.PrecioUnitario,
                (dv.Cantidad * dv.PrecioUnitario) AS Subtotal
            FROM Ventas v
            INNER JOIN DetalleVenta dv ON v.Id = dv.VentaId
            INNER JOIN Productos p ON dv.ProductId = p.Id   
            WHERE v.ClientId = @ClienteId                  
            ORDER BY v.Fecha DESC, v.Id DESC";

        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@ClienteId", clienteId); 

        using var reader = await cmd.ExecuteReaderAsync();

        var ventas = new Dictionary<int, (DateTime Fecha, List<object> Detalles, decimal Total)>();

        while (reader.Read())
        {
            var ventaId = reader.GetInt32(0);     
            var fecha = reader.GetDateTime(1);     
            var producto = reader.GetString(2);    
            var cantidad = reader.GetInt32(3);     
            var precio = reader.GetDecimal(4);     
            var subtotal = reader.GetDecimal(5);  

            if (!ventas.ContainsKey(ventaId))
            {
                ventas[ventaId] = (fecha, new List<object>(), 0);
            }

            ventas[ventaId].Detalles.Add(new
            {
                Producto = producto,
                Cantidad = cantidad,
                Precio = precio,
                Subtotal = subtotal
            });

            ventas[ventaId] = (ventas[ventaId].Fecha, ventas[ventaId].Detalles, ventas[ventaId].Total + subtotal);
        }

        var resultado = ventas.Select(kvp => new
        {
            VentaId = kvp.Key,
            Fecha = kvp.Value.Fecha,
            Detalles = kvp.Value.Detalles,
            Total = kvp.Value.Total
        }).ToList();

        return Ok(resultado);
    }
}