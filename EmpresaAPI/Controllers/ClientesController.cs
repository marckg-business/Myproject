using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly string _connectionString;

    public ClientesController(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection");
    }

    [HttpGet]
    public async Task<IActionResult> GetClientes()
    {
        string query = "SELECT Id, Nombre, Email FROM Clientes";

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
                        Email = reader.GetString(2)
                    });
                }
                return Ok(list);
            }
        }
    }
}