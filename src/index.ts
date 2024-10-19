import * as fs from "fs/promises";
import * as crypto from "crypto";

const algorithm = "aes-256-ctr";

// Fungsi untuk mencetak log
function logMessage(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Fungsi untuk mengencrypt file
async function encryptFile(filePath: string, password: string) {
  try {
    logMessage(`Mulai mengencrypt file: ${filePath}`);
    const data = await fs.readFile(filePath);
    const key = crypto.scryptSync(password, "salt", 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    // Gabungkan IV dengan data terenkripsi
    const encryptedFile = Buffer.concat([iv, encrypted]);

    // Mendapatkan nama file baru
    const fileName =
      filePath.split("/").pop()?.split(".")[0] || "encrypted_file";
    const encryptedFilePath = `${fileName}_encrypt_encrypted.txt`;

    // Menulis file terenkripsi ke file baru
    await fs.writeFile(encryptedFilePath, encryptedFile);
    logMessage(`Berhasil mengencrypt file: ${filePath}`);
    logMessage(`File terenkripsi disimpan sebagai: ${encryptedFilePath}`);
  } catch (err) {
    if (err instanceof Error) {
      logMessage(`Error ketika mengencrypt file: ${err.message}`);
    }
  }
}

// Fungsi untuk decrypt file
async function decryptFile(filePath: string, password: string) {
  try {
    logMessage(`Mulai decrypt file: ${filePath}`);
    const data = await fs.readFile(filePath);
    const key = crypto.scryptSync(password, "salt", 32);

    const iv = data.slice(0, 16);
    const encryptedData = data.slice(16);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    // Menyimpan hasil dekripsi ke file baru
    const fileName =
      filePath.split("/").pop()?.split(".")[0] || "decrypted_file";
    const decryptedFilePath = `${fileName}_decrypted.txt`;

    await fs.writeFile(decryptedFilePath, decrypted);
    logMessage(`Berhasil decrypt file: ${filePath}`);
    logMessage(`File didekripsi disimpan sebagai: ${decryptedFilePath}`);
  } catch (err) {
    if (err instanceof Error) {
      logMessage(`Error ketika decrypt file: ${err.message}`);
    }
  }
}

// Parsing perintah dari command line
const [command, filePath, password] = process.argv.slice(2);

(async () => {
  if (command === "encrypt") {
    await encryptFile(filePath, password);
  } else if (command === "decrypt") {
    await decryptFile(filePath, password);
  } else {
    console.log('Perintah tidak dikenal. Gunakan "encrypt" atau "decrypt".');
  }
})();
