import { motion } from "framer-motion";
import { ReactElement, useEffect, useState } from "react";
import "./MatchFoundOverlay.scss";

interface MatchFoundOverlayProps {
  children?: ReactElement;
  trigger: boolean, duration: number;
  onAnimationEnd?: () => void;
}

function MatchFoundOverlay(props: MatchFoundOverlayProps) {
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    setTrigger(props.trigger);
  }, [props.trigger]);
  return (
    <motion.div
      style={{ transform: trigger ? "translateX(100%)" : "translateX(-100%)", transitionDuration: props.duration + "ms" }}
      className="matchFoundOverlay"
      onEnded={props.onAnimationEnd}
    >
      {props.children ? props.children : <h1 className="matchFoundText">Match Found!</h1>}
    </motion.div>
  );
}

export default MatchFoundOverlay;
