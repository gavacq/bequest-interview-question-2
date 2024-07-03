import express, { json } from "express";
import crypto from "crypto"
import cors from "cors";
import fs from 'fs/promises'

const PORT = 8090;
const app = express();

const database: {data: null | string, hash: null | string} = {data: null, hash: null};

const createHash = (secret: string, data: string) => {
  console.log({
    secret,
    data
  })
  return crypto.createHash('sha256').update(data + secret).digest('base64')
}

const writeInMemoryDb = (data: string, hash: string) => {
  database.data = data
  database.hash = hash
}

const writeBackupDb = async (data: string, hash: string) => {

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

const writeData = async (data: string, secret: string) => {
  const hash = createHash(secret, data)

  writeInMemoryDb(data, hash)

  await writeBackupDb(data, hash)

} 

const verifyHash = (hash: string | null, secret: string, data: string | null) => {
  if (hash == null || data == null) {
    console.error("Cannot verify null parameters")
    return false
  }
  const calculatedHash = createHash(secret, data)
  console.log(calculatedHash)
  console.log(hash)
  return hash == calculatedHash
}

const recoverDatabase = async (secret: string) => {
    let fileData
    try {
      fileData = await fs.readFile('database.json', 'utf-8')
    } catch (error) {
      return {
        code: 4,
        error: "No backup exists"
      }
    }

    try {
      const jsonData = await JSON.parse(fileData)

      // TODO: verify hash
      if (jsonData.data === undefined || jsonData.hash === undefined || !verifyHash(jsonData.hash, secret, jsonData.data)) {
        const message = "Backup is corrupt or invalid"
        console.error(message)
        await fs.unlink('database.json')
        return {
          code: 3,
          error: message
        }
      }

      database.data = jsonData.data
      database.hash = jsonData.hash
      return {
        data: database.data
      }
    } catch (error) {
      throw new Error(`Unable to read database: ${(error as Error).message}`)
    }
}

const readData = async () => {
  if (database.data == null || database.hash == null) {
    try {
      const fileExists = await fs.stat("database.json")
      if (fileExists) {
        return {
          code: 1,
          error: "In memory database missing or corrupt. Please enter verification key and click \"Recover Data\" to attempt data recovery"
        }
      }
    } catch (error) {
      return {
        code: 4,
        error: "No backup exists"
      }
    }
  }

  return {
    ...database
  }
}

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const payload = await readData()
    if (payload.error !== undefined) {
      return res.json({
        code: payload.code,
        error: payload.error
      })
    }

    res.json({data: payload.data})
  } catch (error) {
    res.sendStatus(500)
  }
});

app.post("/", async (req, res) => {
  const {data, secret} = req.body;
  try {
    await writeData(data, secret)
    res.json({data: database.data})
  } catch (error) {
    res.sendStatus(500)
  }
});

app.post("/verify", async (req, res) => {
  const {secret} = req.body
  try {
    const payload = await readData()
    if (payload.error !== undefined) {
      if (payload.code === 1) {
        const recoveryPayload = await recoverDatabase(secret)
        if (recoveryPayload.error !== undefined) {
          return res.json({
            code: recoveryPayload.code,
            error: recoveryPayload.error
          })
        }
      }
      if (payload.code === 4) {
        return res.json({
          code: payload.code,
          error: payload.error
        })
      }
    }

    if (!verifyHash(database.hash, secret, database.data)) {
      return res.json({
        code: 2,
        error: "Verification failed."
      })
    }

    res.json({
      message: "Verification successful"
    })
  } catch (error) {
    res.sendStatus(500)
  }
})

app.post("/recover", async (req, res) => {
  const {secret} = req.body
  try {
    const payload = await recoverDatabase(secret)
    if (payload.error !== undefined) {
      return res.json({
        code: payload.code,
        error: payload.error
      })
    }

    return res.json({
      data: payload.data
    })
  } catch (error) {
    res.sendStatus(500)
  }
})

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
