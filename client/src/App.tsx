import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8090";

function App() {
  const [dataInput, setDataInput] = useState<string>("");
  const [dataResponse, setDataResponse] = useState<string>("")
  const [secret, setSecret] = useState<string>("")
  const [secretError, setSecretError] = useState<string>("")
  const [verifyResult, setVerifyResult] = useState<{code: number, message: string} | null>(null)
  const [dataError, setDataError] = useState<{code: number, error: string} | null>()

  const clearErrorsAndInputs = () => {
    setDataError(null)
    setSecretError("")
    setVerifyResult(null)
    setDataInput("")
    setSecret("")
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
    const oldDataError = {
      code: dataError?.code || 0,
      error: dataError?.error || ""
    }
    clearErrorsAndInputs()

    if (!isInputValid(secret)) {
      setSecretError("Please provide a verification key.")
      setDataError(oldDataError)
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
        boxSizing: "border-box"
      }}
    >
      <span style={{ fontSize: "26px", fontWeight: "bold" }}>Data</span>
      {dataError?.code === 1 && (
        <button style={{ fontSize: "20px", width: "200px", height: "40px" }} onClick={recoverData}>
          Recover Data
        </button>
      )}
      <span>{dataResponse}</span>
      <div style={{ display: "flex", flexDirection: "row", gap: "20px"}}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px"}}>
          <input
            style={{
              fontSize: "30px",
              width: "400px",
            }}
            type="text"
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
          />
        </div>
        <button style={{ fontSize: "20px", height: "40px", width: "140px"}} onClick={updateData}>
          Update Data
        </button>
      </div>
      <span style={{ fontSize: "26px" }}>Verification Key</span>
      <div style={{ display: "flex", flexDirection: "row", gap: "20px"}}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px"}}>
          <input
            style={{
              fontSize: "30px",
              width: "400px",
            }}
            type="password"
            value={secret}
            required={true}
            onChange={(e) => setSecret(e.target.value)}
          />
        </div>
        <button style={{ fontSize: "20px", height: "40px", width: "140px"}} onClick={verifyData}>
          Verify Data
        </button>
      </div>
      {secretError && <span style={{ color: "#ff0000", fontSize: "14px", height: "20px"}}>{secretError}</span>}
      {verifyResult && <span style={{ color: `${verifyResult.code === 4 ? "#ff0000" : "#08d847"}`, fontSize: "14px", height: "20px"}}>{verifyResult.message}</span>}
      {dataError && <span style={{ color: "#ff0000", fontSize: "14px", height: "20px"}}>{dataError.error}</span>}
    </div>
  );
}

export default App;
