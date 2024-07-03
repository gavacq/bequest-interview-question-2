import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8090";

interface ClearOptions {
  clearDataError?: boolean
  clearSecretError?: boolean
  clearVerifyResult?: boolean
  clearDataInput?: boolean
  clearSecret?: boolean
}

function App() {
  const [dataInput, setDataInput] = useState<string>("");
  const [dataResponse, setDataResponse] = useState<string>("") // TODO: display data separately from data input
  const [secret, setSecret] = useState<string>("")
  const [secretError, setSecretError] = useState<string>("")
  const [verifyResult, setVerifyResult] = useState<{code: number, message: string} | null>(null)
  const [dataError, setDataError] = useState<{code: number, error: string} | null>()

  const clearErrorsAndInputs = (options: ClearOptions = {
    clearDataError: true,
    clearDataInput: true,
    clearSecret: true,
    clearVerifyResult: true,
    clearSecretError: true
  }) => {
    options.clearDataError && setDataError(null)
    options.clearSecretError && setSecretError("")
    options.clearVerifyResult && setVerifyResult(null)
    options.clearDataInput && setDataInput("")
    options.clearSecret && setSecret("")
  }

  const getData = async () => {
    const response = await fetch(API_URL);
    const payload  = await response.json();
    if (payload.error) {
      setDataError({
        code: payload.code,
        error: payload.error
      })
      return null
    }

    return payload
  };

  const isInputValid = (input: string) => {
    if (input.length <= 0) {
      return false
    }

    return true
  }

  const updateData = async () => {
    clearErrorsAndInputs()

    if (!isInputValid(secret)) {
      setSecretError("Please provide a verification key.")
      return
    }

    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ data: dataInput, secret }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const {data} = await res.json()
    setDataResponse(data)
    return data
  };

  const verifyData = async () => {
    clearErrorsAndInputs()

    if (!isInputValid(secret)) {
      setSecretError("Please provide a verification key")
      return
    }

    const res = await fetch(`${API_URL}/verify`, {
      method: "POST",
      body: JSON.stringify({
        secret
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })

    const payload = await res.json()
    if (payload.error !== undefined) {
      setVerifyResult({
        message: payload.error,
        code: payload.code
      })
      return
    }

    setVerifyResult({
      code: 0,
      message: payload.message
    })
  };

  const recoverData = async () => {
    clearErrorsAndInputs()

    if (!isInputValid(secret)) {
      setSecretError("Please provide a verification key.")
      return
    }

    const res = await fetch(`${API_URL}/recover`, {
      method: "POST",
      body: JSON.stringify({
        secret
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })

    const payload = await res.json()
    if (payload.error !== undefined) {
      console.log(payload)
      setDataError({
        code: payload.code,
        error:payload.error
      })
      return
    }

    setDataResponse(payload.data)
  }

  useEffect(() => {
    (async () => {
      const payload = await getData()
      if (payload) {
        setDataResponse(payload.data)
      }

    })()

  }, [])

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "absolute",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        fontSize: "30px",
      }}
    >
      <span style={{ fontSize: "26px" }}>Data</span>
      <span>{dataResponse}</span>
      <input
        style={{
          fontSize: "30px",
        }}
        type="text"
        value={dataInput}
        onChange={(e) => setDataInput(e.target.value)}
      />
      {dataError ? <span style={{ color: "#ff0000", fontSize: "14px", height: "20px"}}>{dataError.error}</span>:<div style={{ marginTop: "20px"}}></div>}
      <span style={{ fontSize: "26px" }}>Verification Key</span>
      <input
        style={{
          fontSize: "30px",
        }}
        type="password"
        value={secret}
        required={true}
        onChange={(e) => setSecret(e.target.value)}
      />
      {secretError ? <span style={{ color: "#ff0000", fontSize: "14px", height: "20px"}}>{secretError}</span>: <div style={{ marginTop: "20px"}}></div>}
      {verifyResult ? <span style={{ color: `${verifyResult.code === 2 ? "#ff0000" : "#08d847"}`, fontSize: "14px", height: "20px"}}>{verifyResult.message}</span>: <div style={{ marginTop: "20px"}}></div>}
      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={updateData}>
          Update Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={verifyData}>
          Verify Data
        </button>
        {dataError?.code === 1 && (
          <button style={{ fontSize: "20px" }} onClick={recoverData}>
            Recover Data
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
