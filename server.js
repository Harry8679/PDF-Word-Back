const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const { Document, Packer } = require('docx');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Convertir PDF en Word
app.post('/convert/pdf-to-word', upload.single('file'), async (req, res) => {
    try {
        const pdfPath = req.file.path;

        // Exemple de logique de conversion PDF en texte
        const pdfDoc = await PDFDocument.load(fs.readFileSync(pdfPath));
        const text = await pdfDoc.getTextContent();

        const doc = new Document();
        doc.addSection({ children: [new Paragraph(text)] });

        const wordPath = `uploads/${req.file.filename}.docx`;
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(wordPath, buffer);

        res.download(wordPath, 'converted.docx', () => {
            fs.unlinkSync(pdfPath);
            fs.unlinkSync(wordPath);
        });
    } catch (error) {
        res.status(500).send({ error: 'Conversion échouée' });
    }
});

// Convertir Word en PDF
app.post('/convert/word-to-pdf', upload.single('file'), async (req, res) => {
    try {
        const wordPath = req.file.path;

        // Logic de conversion Word en PDF
        const pdfPath = `uploads/${req.file.filename}.pdf`;
        // Utilisez une librairie comme `docx` pour créer le PDF

        res.download(pdfPath, 'converted.pdf', () => {
            fs.unlinkSync(wordPath);
            fs.unlinkSync(pdfPath);
        });
    } catch (error) {
        res.status(500).send({ error: 'Conversion échouée' });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
