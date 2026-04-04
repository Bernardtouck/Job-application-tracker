import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";

import "./App.css";

// Auth
import { isAuthenticated } from "./services/auth";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [count, setCount] = useState(0);

  // Protected route
  const ProtectedRoute = ({ children }: any) => {
    return isAuthenticated() ? children : <Navigate to="/" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* PAGE LOGIN */}
        <Route path="/" element={<Login />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* PAGE VITE */}
        <Route
          path="/home"
          element={
            <>
              <section id="center">
                <div className="hero">
                  <img
                    src={heroImg}
                    className="base"
                    width="170"
                    height="179"
                    alt=""
                  />
                  <img src={reactLogo} className="framework" alt="React logo" />
                  <img src={viteLogo} className="vite" alt="Vite logo" />
                </div>

                <div>
                  <h1>Get started</h1>
                  <p>
                    Edit <code>src/App.tsx</code> and save to test{" "}
                    <code>HMR</code>
                  </p>
                </div>

                <button
                  className="counter"
                  onClick={() => setCount((count) => count + 1)}
                >
                  Count is {count}
                </button>
              </section>

              <div className="ticks"></div>

              <section id="next-steps">
                <div id="docs">
                  <h2>Documentation</h2>
                  <p>Your questions, answered</p>
                </div>
                <div id="social">
                  {" "}
                  <svg className="icon" role="presentation" aria-hidden="true">
                    {" "}
                    <use href="/icons.svg#social-icon"></use>{" "}
                  </svg>{" "}
                  <h2>Connect with us</h2> <p>Join the Vite community</p>{" "}
                  <ul>
                    {" "}
                    <li>
                      {" "}
                      <a href="https://github.com/vitejs/vite" target="_blank">
                        {" "}
                        <svg
                          className="button-icon"
                          role="presentation"
                          aria-hidden="true"
                        >
                          {" "}
                          <use href="/icons.svg#github-icon"></use>{" "}
                        </svg>{" "}
                        GitHub{" "}
                      </a>{" "}
                    </li>{" "}
                    <li>
                      {" "}
                      <a href="https://chat.vite.dev/" target="_blank">
                        {" "}
                        <svg
                          className="button-icon"
                          role="presentation"
                          aria-hidden="true"
                        >
                          {" "}
                          <use href="/icons.svg#discord-icon"></use>{" "}
                        </svg>{" "}
                        Discord{" "}
                      </a>{" "}
                    </li>{" "}
                    <li>
                      {" "}
                      <a href="https://x.com/vite_js" target="_blank">
                        {" "}
                        <svg
                          className="button-icon"
                          role="presentation"
                          aria-hidden="true"
                        >
                          {" "}
                          <use href="/icons.svg#x-icon"></use>{" "}
                        </svg>{" "}
                        X.com{" "}
                      </a>{" "}
                    </li>{" "}
                    <li>
                      {" "}
                      <a
                        href="https://bsky.app/profile/vite.dev"
                        target="_blank"
                      >
                        {" "}
                        <svg
                          className="button-icon"
                          role="presentation"
                          aria-hidden="true"
                        >
                          {" "}
                          <use href="/icons.svg#bluesky-icon"></use>{" "}
                        </svg>{" "}
                        Bluesky{" "}
                      </a>{" "}
                    </li>{" "}
                  </ul>{" "}
                </div>{" "}
              </section>
              <div className="ticks">
              </div> <section id="spacer"></section>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
