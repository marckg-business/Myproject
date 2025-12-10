var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// 👇 Habilitar servir archivos estáticos (HTML, CSS, JS, imágenes)
app.UseStaticFiles();

// 👇 Opcional: redirigir la raíz (/) a index.html
app.MapGet("/", () => Results.Redirect("/index.html"));

// Si quieres que / cargue directamente index.html sin redirección:
// app.UseFileServer(); // ← alternativa más completa (incluye default files)

app.Run();