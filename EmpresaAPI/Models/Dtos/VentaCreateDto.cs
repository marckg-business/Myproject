using System.Collections.Generic;

namespace EmpresaAPI.Models.Dtos
{
    public class VentaCreateDto
    {
        public int ClienteId { get; set; }
        public List<VentaDetalleDto> Detalles { get; set; }
    }
}
