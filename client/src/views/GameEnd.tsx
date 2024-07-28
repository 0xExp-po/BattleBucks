import Button from "../components/Button/Button";
import Logo from "../components/Logo/Logo";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, useAnimate, useMotionValue, useTransform, animate, useAnimation } from "framer-motion";

function GameEnd() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const ref = useRef();

  const invalid = state?.game === undefined;

  useEffect(() => {
    invalid && navigate("/");
  }, [invalid]);

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 1.5,
      onUpdate(value) {
        let calculated = (2 * value * state?.game?.buyin / 100).toFixed(2);
        if (value == 100) calculated = Math.round(calculated);
        ref.current.innerHTML = "+$" + calculated;
      }
    });
    return controls.stop;
  }, [])

  if (invalid)
    return <div></div>;

  return (
    <div className="flexCol flex" style={{ margin: "1em" }}>
      <Logo />
      <h2>You won!</h2>
      <h3 ref={ref}></h3>
      <div className="flexCol" style={{ margin: "2em 0", gap: "1em" }}>
        <Button type="big" className="flex" onClick={() => { setA(a + 1) }}><b>Rematch</b></Button>
        <Button type="big" className="flex"><b>New Match</b></Button>
        <Button type="big" className="flex" onClick={() => navigate("/")}><b>Exit</b></Button>
      </div>
    </div>
  );
}

export default GameEnd;