import { motion } from "framer-motion";
import { ReactElement } from "react";
import "./MatchFoundOverlay.scss";

interface MatchFoundOverlayProps {
  children?: ReactElement;
  trigger: boolean, duration: number;
  onAnimationEnd?: () => void;
}

function MatchFoundOverlay(props: MatchFoundOverlayProps) {
  return (
    <motion.div
      style={{ transform: props.trigger ? "translateX(100%)" : "translateX(-100%)", transitionDuration: props.duration + "ms" }}
      className="matchFoundOverlay"
      onEnded={props.onAnimationEnd}
    >
      {props.children ? props.children : <h1 className="matchFoundText">Match Found!</h1>}
    </motion.div>
  );
}

export default MatchFoundOverlay;
