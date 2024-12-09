async function submitForm() {
    // Obtener datos del formulario
    const song = document.getElementById('song').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const description = document.getElementById('description').value;
    const profession = document.getElementById('profession').value;

    // Preparar los datos en un objeto
    const requestData = { song, gender, description, profession };

    try {
        // Llamar al servidor para generar el avatar
        const response = await fetch("/generate-avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error("Error en la generación del avatar.");
        }

        const responseData = await response.json();
        const avatarUrl = responseData.avatarUrl;

        // Mostrar el avatar y un enlace para descargarlo
        document.getElementById("result").innerHTML = `
            <h2>Avatar Generado</h2>
            <img src="${avatarUrl}" alt="Avatar Noir" width="200">
            <p><a href="${avatarUrl}" download="avatar_noir.png">Descargar Avatar</a></p>
        `;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("result").innerHTML = "Hubo un error al generar el avatar. Inténtalo de nuevo.";
    }
}
