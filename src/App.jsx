import { useEffect, useRef, useState } from "react";
import "./App.css";

import { gameItems } from "./gameData";

const ROUND_TIME = 180;
const PREPARATION_TIME = 5;


// ======================================================
// EMBARALHAR ITENS
// ======================================================

function shuffleItems(items) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(
      Math.random() * (i + 1)
    );

    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i],
    ];
  }

  return shuffled;
}


// ======================================================
// APP
// ======================================================

function App() {
  // Tela atual:
  // start | countdown | game | result
  const [screen, setScreen] = useState("start");

  const [currentItem, setCurrentItem] = useState("");

  const [countdown, setCountdown] =
    useState(PREPARATION_TIME);

  const [timeLeft, setTimeLeft] =
    useState(ROUND_TIME);

  // success | error | timeout
  const [resultType, setResultType] =
    useState("success");

  // Fila embaralhada.
  // Não repete até passar pelos 10 itens.
  const queueRef = useRef([]);


  // ====================================================
  // ESCOLHER ITEM SEM REPETIR
  // ====================================================

  function getNextItem() {
    if (queueRef.current.length === 0) {
      queueRef.current = shuffleItems(gameItems);
    }

    return queueRef.current.shift();
  }


  // ====================================================
  // INICIAR RODADA
  // ====================================================

  function startRound() {
    const item = getNextItem();

    setCurrentItem(item);

    setCountdown(PREPARATION_TIME);

    setTimeLeft(ROUND_TIME);

    setResultType("success");

    setScreen("countdown");

    requestWakeLock();

    requestFullscreen();
  }


  // ====================================================
  // CONTAGEM DE 5 SEGUNDOS
  // ====================================================

  useEffect(() => {
    if (screen !== "countdown") return;

    if (countdown <= 0) {
      setTimeLeft(ROUND_TIME);

      setScreen("game");

      return;
    }

    const timer = setTimeout(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [screen, countdown]);


  // ====================================================
  // CRONÔMETRO DE 3 MINUTOS
  // ====================================================

  useEffect(() => {
    if (screen !== "game") return;

    if (timeLeft <= 0) {
      finishByTime();

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [screen, timeLeft]);


  // ====================================================
  // ACERTO
  // ====================================================

  function finishRound() {
    setResultType("success");

    vibrate([
      100,
      60,
      100,
    ]);

    setScreen("result");
  }


  // ====================================================
  // ERRO
  // ====================================================

  function failRound() {
    setResultType("error");

    vibrate([
      180,
      80,
      180,
    ]);

    setScreen("result");
  }


  // ====================================================
  // TEMPO ESGOTADO
  // ====================================================

  function finishByTime() {
    setResultType("timeout");

    vibrate([
      200,
      100,
      200,
      100,
      300,
    ]);

    setScreen("result");
  }


  // ====================================================
  // VOLTAR AO INÍCIO
  // ====================================================

  function goHome() {
    setScreen("start");

    setCurrentItem("");

    setCountdown(PREPARATION_TIME);

    setTimeLeft(ROUND_TIME);

    setResultType("success");
  }


  // ====================================================
  // FORMATAR CRONÔMETRO
  // ====================================================

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  }


  // ====================================================
  // VIBRAÇÃO
  // ====================================================

  function vibrate(pattern) {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }


  // ====================================================
  // WAKE LOCK
  // ====================================================

  async function requestWakeLock() {
    if (!("wakeLock" in navigator)) {
      return;
    }

    try {
      await navigator.wakeLock.request(
        "screen"
      );
    } catch (error) {
      console.log(
        "Wake Lock indisponível:",
        error
      );
    }
  }


  // ====================================================
  // FULLSCREEN
  // ====================================================

  async function requestFullscreen() {
    try {
      if (
        !document.fullscreenElement &&
        document.documentElement
          .requestFullscreen
      ) {
        await document.documentElement
          .requestFullscreen();
      }
    } catch {
      // Alguns navegadores mobile
      // podem bloquear fullscreen.
    }
  }


  // ====================================================
  // TELA INICIAL
  // ====================================================

  if (screen === "start") {
    return (
      <main className="screen start-screen">
        <div className="shape shape-yellow" />
        <div className="shape shape-pink" />
        <div className="shape shape-cyan" />

        <section className="start-content">

          <span className="event-tag">
            VIVA FEST
          </span>

          <p className="eyebrow">
            VIVA O DESAFIO
          </p>

          <h1 className="game-title">
            QUEM
            <span>SOU EU?</span>
          </h1>

          <p className="description">
            Coloque o celular na testa e
            descubra quem — ou o que —
            você é.
          </p>

          <div className="info-grid">

            <div className="info-card yellow">
              <strong>5s</strong>
              <span>
                para preparar
              </span>
            </div>

            <div className="info-card cyan">
              <strong>3min</strong>
              <span>
                para descobrir
              </span>
            </div>

            <div className="info-card pink">
              <strong>10</strong>
              <span>
                possibilidades
              </span>
            </div>

          </div>

          <button
            className="primary-button"
            onClick={startRound}
          >
            COMEÇAR
          </button>

          <p className="start-tip">
            Depois de tocar em começar,
            coloque o celular na testa.
          </p>

        </section>
      </main>
    );
  }


  // ====================================================
  // CONTAGEM
  // ====================================================

  if (screen === "countdown") {
    return (
      <main className="screen countdown-screen">

        <section className="countdown-content">

          <p className="countdown-message">
            COLOQUE O CELULAR NA TESTA
          </p>

          <div
            key={countdown}
            className="countdown-number"
          >
            {countdown}
          </div>

          <p className="countdown-tip">
            Não olhe a resposta 👀
          </p>

        </section>

      </main>
    );
  }


  // ====================================================
  // JOGO
  // ====================================================

  if (screen === "game") {
    return (
      <main className="screen game-screen">

        <section className="game-card">

          <header className="game-header">

            <span className="mini-logo">
              VIVA FEST
            </span>

            <span
              className={`timer ${
                timeLeft <= 30
                  ? "timer-warning"
                  : ""
              }`}
            >
              {formatTime(timeLeft)}
            </span>

          </header>


          <p className="challenge-label">
            QUEM SOU EU?
          </p>


          <div className="answer">
            {currentItem}
          </div>


          <footer className="game-footer">

            <span className="game-hint">
              PERGUNTE • PENSE • DESCUBRA
            </span>

            <div className="answer-buttons">

              <button
                className="wrong-button"
                onClick={failRound}
              >
                <span className="button-icon">
                  ✕
                </span>

                ERREI
              </button>


              <button
                className="correct-button"
                onClick={finishRound}
              >
                <span className="button-icon">
                  ✓
                </span>

                ACERTEI
              </button>

            </div>

          </footer>

        </section>

      </main>
    );
  }


  // ====================================================
  // RESULTADO
  // ====================================================

  return (
    <main className="screen result-screen">

      <section className="result-content">

        <p className="eyebrow">
          VIVA O DESAFIO
        </p>


        <h2
          className={`
            result-title
            ${
              resultType === "timeout"
                ? "timeout"
                : ""
            }
            ${
              resultType === "error"
                ? "error"
                : ""
            }
          `}
        >
          {resultType === "timeout"
            ? "TEMPO!"
            : resultType === "error"
            ? "QUASE!"
            : "MANDOU BEM!"}
        </h2>


        <p className="result-label">
          Você era:
        </p>


        <div className="result-answer">
          {currentItem}
        </div>


        <button
          className="primary-button"
          onClick={startRound}
        >
          PRÓXIMO JOGADOR
        </button>


        <button
          className="secondary-button"
          onClick={goHome}
        >
          VOLTAR AO INÍCIO
        </button>

      </section>

    </main>
  );
}

export default App;