const fs = require('fs');
const pdf = require('pdf-parse');

fs.readFile('./Company Handbook.pdf', async (err, data) => {
  if (err) {
    console.error("Error reading the PDF:", err);
    return;
  }

  try {
    const pdfData = await pdf(data);
    console.log("Extracted PDF content:\n", pdfData.text);
  } catch (error) {
    console.error("Error parsing the PDF:", error);
  }
});
