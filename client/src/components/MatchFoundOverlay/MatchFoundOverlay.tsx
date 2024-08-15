import { motion } from "framer-motion";
import "./MatchFoundOverlay.scss";

function MatchFoundOverlay(props: { trigger: boolean, duration: number }) {
  return (
    <motion.div
      style={{ transform: props.trigger ? "translateX(100%)" : "translateX(-100%)", transitionDuration: props.duration + "ms" }}
      className="matchFoundOverlay"
    >
      <h1 className="matchFoundText">Match Found!</h1>
    </motion.div>
  );
}

export default MatchFoundOverlay;
