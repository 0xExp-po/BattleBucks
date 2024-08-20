import Button from "../components/Button/Button";
import Logo from "../components/Logo/Logo";
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { animate } from "framer-motion";
import Token from "../components/Token/Token";

function GameEnd() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const ref = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  const invalid = state?.game === undefined;

  useEffect(() => {
    firstRender.current && invalid && navigate("/");
    firstRender.current = false;
  }, [invalid]);

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 1.5,
      onUpdate(value) {
        if (!ref.current)
          return;
        const maxNum = state.game.result > 0 ? 2 * state?.game?.buyin : state?.game?.buyin;
        // 101 instead of 100 is so that the final number is shown only for 100/100, not for 99/100 or earlier
        const calculated = value === 100 ? maxNum.toString() : (maxNum * value / 101).toFixed(2);
        ref.current.innerHTML = calculated;
      }
    });
    return controls.stop;
  }, [])

  if (invalid)
    return <div></div>;

  return (
    <div className="flexCol flex" style={{ padding: "1em" }}>
      <Logo />
      <h2>{state.game.result > 0 ? "You Won!" : "You Lost..."}</h2>
      <h3 className="flexRow center">{state.game.result > 0 ? "+" : "-"}<Token innerRef={ref}>0</Token></h3>
      <div className="flexCol" style={{ margin: "2em 0", gap: "1em" }}>
        <Button type="big" className="flex" onClick={() => navigate(-1)}>Rematch</Button>
        <Button type="big" className="flex" onClick={() => navigate("/vs/buyin")}>New Match</Button>
        <Button type="big" className="flex" onClick={() => navigate("/")}>Exit</Button>
      </div>
    </div>
  );
}

export default GameEnd;