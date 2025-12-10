using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly string _connectionString;

    public ProductosController(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection");
    }

    [HttpGet]
    public async Task<IActionResult> GetProductos()
    {
        string query = "SELECT Id, Nombre, Precio, Stock FROM Productos";

        using (var conn = new SqlConnection(_connectionString))
        {
            await conn.OpenAsync();

            using (var cmd = new SqlCommand(query, conn))
            using (var reader = await cmd.ExecuteReaderAsync())
            {
                var list = new List<object>();

                while (reader.Read())
                {
                    list.Add(new
                    {
                        Id = reader.GetInt32(0),
                        Nombre = reader.GetString(1),
                        Precio = reader.GetDecimal(2),
                        Stock = reader.GetInt32(3)
                    });
                }

                return Ok(list);
            }
        }
    }
}
