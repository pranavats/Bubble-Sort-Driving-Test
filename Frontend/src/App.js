import { BrowserRouter, Routes, Route } from "react-router-dom";

import Homepage from "./pages/Homepage";
import { BubbleTest } from "./pages/BubbleTest.tsx";
import { useEffect, useState } from "react";
import client from "./pages/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpRightAndDownLeftFromCenter } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const App = ({ element }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  useEffect(() => {
    // console.log("publicURL" + process.env.PUBLIC_URL);
    // console.log("pathname" + window.location.pathname);
    if (userId != null) {
      // console.log(userId);
      getAlgorithm(userId);
    }
    else if (localStorage.getItem("userId") !== null) {
      setUserId(localStorage.getItem("userId"));
    }
    else if (window.location.pathname.slice(25) !== "/home") {
      //Add swal and absolute address
      window.location.pathname = window.location.pathname.slice(1, 25) + "/home";
    }

    // Add full screen event listener
    [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
    ].forEach((fchange) =>
      document.addEventListener(fchange, () => {
        if (document.fullscreenElement) setIsFullScreen(true);
        else if (document.mozFullScreenElement) setIsFullScreen(true);
        else if (document.webkitFullscreenElement) setIsFullScreen(true);
        else setIsFullScreen(false);
      })
    );
  }, [userId]);

  const getAlgorithm = async (input) => {
    if (input !== null) {
      let final = "/getAlgorithm/" + input;
      await client
        .get(final)
        .catch((error) => {
          if (window.location.pathname.slice(25) !== "/home") {
            window.location.pathname = window.location.pathname.slice(1, 25) + "/home";
          }
        });
    }
  };

  const toggleFullScreen = () => {
    if (isFullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen();
      }
    } else {
      let elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen({ navigationUI: "hide" });
      } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen({ navigationUI: "hide" });
      } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen({ navigationUI: "hide" });
      }
    }
  };

  if (!isFullScreen) {
    Swal.fire({
      title: "Full Screen Mode",
      text: "This test requires you to be in full screen mode",
      icon: "info",
      confirmButtonText: "Enter Full Screen",
      confirmButtonColor: "#00bcd4",
      showCloseButton: true,
      // Add function to close button
      showConfirmButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.value) {
        toggleFullScreen();
      } else if (result.dismiss === "close") {
        console.log("clicked x");
      }
    });
  }

  return (
    <div className="flex flex-col h-screen overflow-auto">
      <div className="bg-gray-800 flex justify-between py-4 px-2 text-md text-gray-100 font-bold">
        <h1 className="text-xl">Bubble Sort Driving Test Study</h1>
        <div className="flex w-1/6 justify-end items-center">
          <button onClick={toggleFullScreen} className="px-2">
            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
          </button>
        </div>
      </div>
      <BrowserRouter basename={window.location.pathname.slice(1, 25)}>
        <Routes>
          <Route exact path="/home" element={<Homepage />} />
          <Route exact path="/test" element={<BubbleTest userId={userId} />} />
          {/* Error for all other paths */}
          <Route element={() => <div>Hello World</div>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
