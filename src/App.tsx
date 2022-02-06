import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  // after login you will redirect to http://localhost:3000?code=xyz
  // it means your logedin
  const callbackCode = new URLSearchParams(window.location.search);
  useEffect(() => {
    // check if already token and refresh exist
    const spotToken = localStorage.getItem("spotToken");
    const spotRefresh = localStorage.getItem("spotRefresh");
    if (spotToken && spotRefresh) {
      // refresh the token
      fetch("http://localhost:800/api/spotify/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: spotRefresh,
          refresh: true,
        }),
      });
    }
  }, []);
  // if user logedin then send the code to backend to get the access and refresh token

  return (
    <div className="Parent">
      <div className="Main">
        <h2>Spotify + React</h2>
        <hr />
        <div className="Card">
          <p>
            Login to your spotify account and listen to your music in here😊
          </p>
          <div className="Btn">
            <a href="/">Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
