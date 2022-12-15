import { useState, useEffect } from "react";

import logo from "./logo.svg";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [currURL, setURL] = useState("");
  const [currentEmail, setEmail] = useState("");
  //useEffect(() => {}, []);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };
  const handleURLChange = (event) => {
    setURL(event.target.value);
  };

  const handleClick = async () => {
    setData("");
    if (currentEmail.trim() === "" && currURL.trim() === "") {
      setErr("Please input email and url to receive your results");
      return;
    }
    //Check if nodejs is down ?
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api?url=${encodeURIComponent(currURL)}&email=${encodeURIComponent(
          currentEmail
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      )
        .then((data) => data.json())
        .then((data) => {
          console.log("Setting loading false1 ", data);
          setIsLoading(false);
          setData(data);
        })
        .catch((error) => {
          console.error("Setting loading false2 ", error);
          setIsLoading(false);
          setData(data);
        });

      // if (!response.ok) {
      //   throw new Error(`Error! status: ${response.status}`);
      // }
    } catch (err) {
      console.error("Setting loading false3 ");
      setErr(err);
      setIsLoading(false);
    } finally {
      //setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>{!isLoading ? "" : "Loading"}</p>
        <p>Current URL: {currURL}</p>
        {err && <p>Errors: {err}</p>}
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          onChange={handleEmailChange}
        />
        <label for="url">url</label>
        <input type="text" id="url" name="url" onChange={handleURLChange} />
        {data && <p>{data}</p>}
        <button onClick={handleClick}>Fetch data</button>
      </header>
    </div>
  );
}

export default App;
