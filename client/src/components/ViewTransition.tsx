import { motion, useIsPresent } from "framer-motion";
import { Children } from "../utils/types";

interface SlideRightChildren {
  children: Children;
};

function ViewTransition(props: SlideRightChildren) {
  const isPresent = useIsPresent();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.1, ease: "easeOut" } }}
      exit={{ opacity: 0, transition: { duration: 0.1, ease: "easeOut" } }}
      style={{ opacity: isPresent ? 0 : 1 }}
      className="flex"
    >
      {props.children}
    </motion.div>
  );
}

export default ViewTransition;