import { useEffect, useState, useMemo } from "react";
import Player from "./components/Player";
import "./App.css";

export default function App() {
  // after login you will redirect to http://localhost:3000?code=xyz
  // it means your logedin
  const callbackCode = new URLSearchParams(window.location.search).get("code");
  const [btnHref, setBtnHref] = useState<string>("");
  const [showPlayer, setShowPlayer] = useState<boolean>(false);
  const renderPlayer = useMemo(() => {
    if (showPlayer) {
      const codeToken = localStorage.getItem("spotToken");
      return <Player code={codeToken} />;
    }
  }, [showPlayer]);

  useEffect(() => {
    // check if already token and refresh exist token
    const spotToken = localStorage.getItem("spotToken");
    const spotRefresh = localStorage.getItem("spotRefresh");
    if (spotToken && spotRefresh) {
      // refresh the token
      fetch("http://localhost:8000/api/spotify/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: spotRefresh,
          refresh: true,
        }),
      }).then(async (response) => {
        if (response.status === 200) {
          const payback = await response.json();
          localStorage.setItem("spotCode", payback?.accessToken);
          setShowPlayer(true);
        } else {
          localStorage.removeItem("spotToken");
          localStorage.removeItem("spotRefresh");
        }
      });
    }
  }, []);
  // if user logedin, then send the code to backend to get the access and refresh token
  useEffect(() => {
    if (callbackCode) {
      new URLSearchParams(window.location.search).set("loged", "true");
      fetch("http://localhost:8000/api/spotify/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: callbackCode,
        }),
      }).then(async (response) => {
        if (response.status === 200) {
          const payback = await response.json();
          localStorage.setItem("spotCode", payback?.accessToken);
          localStorage.setItem("spotRefresh", payback?.refreshToken);
          setShowPlayer(true);
        }
      });
    }
    // create authorization url used in login href
    const main_uri = "https://accounts.spotify.com/authorize";
    const redirect_uri = window.location.href + "dashboard";
    console.log("rrr", redirect_uri);
    const scopes = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-library-read",
      "user-library-modify",
      "user-read-playback-state",
      "user-modify-playback-state",
      "playlist-read-collaborative",
      "playlist-read-private",
    ];
    const full_url = `${main_uri}?client_id=b2cc798a3c574821a3d91efcd4159124&response_type=code&show_dialog=true&redirect_uri=${redirect_uri}&scope=${scopes.join(
      "%20"
    )}`;
    setBtnHref(full_url);
  }, [callbackCode]);
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
            {!showPlayer && <a href={btnHref}>Login</a>}
            {renderPlayer}
          </div>
        </div>
      </div>
    </div>
  );
}
