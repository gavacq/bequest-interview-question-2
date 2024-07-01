import express, { json } from "express";
import crypto from "crypto"
import cors from "cors";
import fs from 'fs/promises'

const PORT = 8090;
const app = express();

const database: {data: null | string, hash: null | string} = {data: null, hash: null};

const createHash = (secret: string, data: string) => {
  return crypto.createHash('sha256').update(data + secret).digest('base64')
}

const writeData = async (data: string, secret: string) => {
  const hash = createHash(data, secret)

  database.data = data
  database.hash = hash

  const serializedData = JSON.stringify({
    data,
    hash
  })

  try {
    await fs.writeFile('database.json', serializedData)
  } catch (error: any) {
    if (error instanceof Error) {
      throw new Error(`Unable to backup database: ${error.message}`)
    }
  }
} 

const verifyHash = (hash: string, secret: string, data: string) => {
  const calculatedHash = createHash(secret, data)
  return hash == calculatedHash
}

const recoverDatabase = async (secret: string) => {
    try {
      const fileData = await fs.readFile('database.json', 'utf-8')
      const jsonData = await JSON.parse(fileData)

      if (!verifyHash(jsonData.hash, secret, jsonData.data)) {
        throw new Error("The secret is incorrect for the database hash")
      }

      database.data = jsonData.data
      database.hash = jsonData.hash
      return database.data
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Unable to read database: ${error.message}`)
      }
    }
}

const readData = async (secret: string) => {
  if (database.data == null || database.hash == null) {
    await recoverDatabase(secret)
  } else {
    if (!verifyHash(database.hash, secret, database.data)) {
      throw new Error("The secret is incorrect for the database hash")
    }
  }

  return database.data
}

app.use(cors());
app.use(express.json());

// Routes

app.get("/", (req, res) => {
  // let token = req.cookies.token
  // let hash = hash(token, req.message)
  // get database
  // filter all non-userid records out
  // res.json(recordsForThisUser);
});

app.post("/", async (req, res) => {
  const {data, secret} = req.body;
  try {
    await writeData(data, secret)
    res.json({data: database.data}).status(200);
  } catch (error) {
    res.sendStatus(500)
  }
});

app.post("/verify", async (req, res) => {
  const {secret} = req.body
  try {
    await readData(secret)
    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(500)
  }
})

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
