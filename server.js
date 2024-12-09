const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Replicate = require('replicate');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/generate-avatar', async (req, res) => {
  const { song, gender, description, profession } = req.body;
  const prompt = `Retrato de un personaje estilo novela gráfica noir. Es ${gender} con ${description} y trabaja como ${profession}. Estilo oscuro y sombrío similar a Sin City.`;

  try {
    console.log("Enviando solicitud a Replicate para generar la imagen...");

    // Crear predicción y obtener ID
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-schnell",
      input: { prompt: prompt }
    });

    const predictionId = prediction.id;

    // Esperar a que la predicción se complete
    let outputUrl = null;
    while (!outputUrl) {
      const predictionStatus = await replicate.predictions.get(predictionId);

      if (predictionStatus.status === 'succeeded') {
        outputUrl = predictionStatus.output[0]; // Obtener URL de la imagen generada
        console.log("Imagen generada en:", outputUrl);
      } else if (predictionStatus.status === 'failed') {
        throw new Error("La predicción falló en Replicate.");
      } else {
        console.log("Esperando a que se complete la generación de la imagen...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Guardar datos en JSON
    const userData = {
      song,
      gender,
      description,
      profession,
      prompt,
      avatarUrl: outputUrl
    };

    const dataFilePath = path.join(__dirname, 'data.json');
    let jsonData = [];

    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath);
      jsonData = JSON.parse(fileData);
    }

    jsonData.push(userData);
    fs.writeFileSync(dataFilePath, JSON.stringify(jsonData, null, 2));

    console.log("Avatar generado y guardado correctamente.");
    res.json({ avatarUrl: outputUrl });
  } catch (error) {
    console.error('Error al generar el avatar:', error.message);
    res.status(500).json({ error: 'Error al generar el avatar.' });
  }
});

// Nuevo endpoint para descargar data.json
app.get('/data.json', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('No data found');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

