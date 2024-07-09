import { CSSProperties } from "react";
import { Children } from "../utils/types";


interface ButtonProps {
  children: Children;
  type?: "big" | "normal";
  style?: CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

function Button(props: ButtonProps) {
  return (
    <button className={(props.type === "big" ? "bigButton" : "button")  + (props.className ? " " + props.className : "")} style={props.style} onClick={props.onClick}>
      <div style={{ fontWeight: "bold" }}>{props.children}</div>
    </button>
  );
}

export default Button;
