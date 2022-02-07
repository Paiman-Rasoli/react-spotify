import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Player from "./components/Player";
import "./App.css";

export default function App() {
  // after login you will redirect to http://localhost:3000?code=xyz
  // it means your logedin
  const callbackCode = new URLSearchParams(window.location.search).get("code");
  const [btnHref, setBtnHref] = useState<string>("");
  const [showPlayer, setShowPlayer] = useState<boolean>(false);
  const [searchParam, setSearchParam] = useSearchParams({});
  const renderPlayer = useMemo(() => {
    if (showPlayer) {
      const codeToken = localStorage.getItem("spotCode");
      return <Player code={codeToken} />;
    }
  }, [showPlayer]);

  useEffect(() => {
    // check if already token and refresh exist token
    const spotToken = localStorage.getItem("spotCode");
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
          localStorage.removeItem("spotCode");
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
          setSearchParam({ welcome: "user" });
          setShowPlayer(true);
        }
      });
    }
    // create authorization url used in login href
    const main_uri = "https://accounts.spotify.com/authorize";
    // this url also must include in you spotify app dashboard!
    const redirect_uri = process.env.REDIRECT_URL || "http://localhost:3000";
    // after login which activity you can
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
    const full_url = `${main_uri}?client_id=${
      process.env.CLIENT_ID
    }&response_type=code&show_dialog=true&redirect_uri=${redirect_uri}&scope=${scopes.join(
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
            {showPlayer
              ? "Just Enjoy From Listining.😍"
              : "Login to your spotify account and listen to your music in here😊"}
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
