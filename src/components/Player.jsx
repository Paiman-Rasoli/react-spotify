import React, { useState, useEffect } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import SpotifyWebApi from "spotify-web-api-node";
import PulseLoader from "react-spinners/PulseLoader";

const Player = ({ code }) => {
  const [play, setPlay] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    accessToken: code,
  });
  useEffect(() => {
    async function getUserPlaylists() {
      spotifyApi.getMySavedAlbums({ offset: 1, limit: 10 }).then((data) => {
        const rndInt = Math.floor(Math.random() * data.body.items.length) + 1;
        console.log(
          "check",
          rndInt,
          data.body.items[rndInt - 1].album.artists[0].uri
        );
        setData([data.body.items[rndInt - 1].album.artists[0].uri]);
        setLoading(false);
        setPlay(true);
      });
    }
    setLoading(true);
    getUserPlaylists();
  }, [code]);

  if (!code) return <></>;
  if (loading)
    return (
      <div className="d-flex justify-content-center mt-2">
        <PulseLoader size={12} />{" "}
      </div>
    );

  if (data.length > 0) {
    return (
      <SpotifyPlayer
        token={code}
        callback={(state) => !state.isPlaying && setPlay(false)}
        play={play}
        uris={data}
        styles={{
          activeColor: "#fff",
          bgColor: "#333",
          color: "#fff",
          loaderColor: "#fff",
          sliderColor: "#fff",
          trackArtistColor: "#ccc",
          trackNameColor: "#fff",
          height: "60px",
        }}
      />
    );
  }
  return <></>;
};

export default Player;
