import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8090";

function App() {
  const [data, setData] = useState<string>("");
  const [secret, setSecret] = useState<string>("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const response = await fetch(API_URL);
    const { data } = await response.json();
    setData(data);
  };

  const isInputValid = (input: string) => {
    if (input.length <= 0) {
      return false
    }

    return true
  }

  const updateData = async () => {
    if (!isInputValid(secret)) {
      setError("Please provide a verification key.")
      return
    }

    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ data, secret }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const body = await res.json()
    console.log(body)
  };

  const verifyData = async () => {
    throw new Error("Not implemented");
  };

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
      <div>Saved Data</div>
      <span style={{ fontSize: "26px" }}>Data</span>
      <input
        style={{
          fontSize: "30px",
          marginBottom: "20px"
        }}
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />
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
      {error ? <span style={{ color: "#ff0000", fontSize: "14px", height: "20px"}}>{error}</span>: <div style={{ marginTop: "20px"}}></div>}
      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={updateData}>
          Update Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={verifyData}>
          Verify Data
        </button>
      </div>
    </div>
  );
}

export default App;
