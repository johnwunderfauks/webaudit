import { useState, useEffect } from "react";
import axios from "axios";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");
  const [currURL, setURL] = useState("");
  //useEffect(() => {}, []);

  const handleURLChange = (event) => {
    setURL(event.target.value);
  };

  const handleClick = async () => {
    setIsLoading(true);

    try {
      // axios
      //   .get(`/api?url=${encodeURIComponent(currURL)}`)
      //   .then((response) => {
      //     console.log(response.data);
      //     setData(data.data);
      //     setIsLoading(false);
      //   })
      //   .catch(function (error) {
      //     setErr(error);
      //     setIsLoading(false);
      //   });
      const response = await fetch(`/api?url=${encodeURIComponent(currURL)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })
        .then((data) => data.json())
        .then((data) => {
          console.log(data);
          setIsLoading(false);
          setData(data);
        })
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
          setData(data);
        });

      // if (!response.ok) {
      //   throw new Error(`Error! status: ${response.status}`);
      // }
    } catch (err) {
      setErr(err);
      setIsLoading(false);
    } finally {
      //setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{!isLoading ? "Loading..." : "Done!"}</p>
        <p>Current URL: {currURL}</p>
        {err && <p>Errors: {err}</p>}
        <input
          type="text"
          id="message"
          name="message"
          onChange={handleURLChange}
        />
        {data && <p>{data}</p>}
        <button onClick={handleClick}>Fetch data</button>
      </header>
    </div>
  );
}

export default App;
