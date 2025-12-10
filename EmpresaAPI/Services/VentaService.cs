using EmpresaAPI.Models.Dtos;
using Microsoft.Data.SqlClient;
using System.Data;

namespace EmpresaAPI.Services
{
    public class VentaService
    {
        private readonly string _connectionString;

        public VentaService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public int RegistrarVenta(VentaCreateDto venta)
        {
            int ventaId;

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {   
                conn.Open();

                // Crear venta
                using (SqlCommand cmd = new SqlCommand("RegistrarVenta", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ClienteId", venta.ClienteId);

                    ventaId = Convert.ToInt32(cmd.ExecuteScalar());
                }

                // Insertar detalles
                foreach (var detalle in venta.Detalles)
                {
                    using (SqlCommand cmd = new SqlCommand("RegistrarDetalleVenta", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@VentaId", ventaId);
                        cmd.Parameters.AddWithValue("@ProductoId", detalle.ProductId);
                        cmd.Parameters.AddWithValue("@Cantidad", detalle.Cantidad);

                        cmd.ExecuteNonQuery();
                    }
                }
            }

            return ventaId;
        }
    }
}
