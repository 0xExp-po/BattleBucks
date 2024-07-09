import { motion, useIsPresent } from "framer-motion";
import { Children } from "../utils/types";

interface SlideRightChildren {
  children: Children;
};

function SlideRight(props: SlideRightChildren) {
  const isPresent = useIsPresent();

  return (
    <motion.div
      initial={{ translateX: "100%" }}
      animate={{ translateX: "0%", transition: { duration: 0.2, ease: "easeOut" } }}
      exit={{ translateX: "100%", transition: { duration: 0.2, ease: "easeOut" } }}
      style={{ originX: isPresent ? 0 : 1 }}
    >
      {props.children}
    </motion.div>
  );
}

export default SlideRight;