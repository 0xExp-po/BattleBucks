import Ton from "../../assets/ton.webp";

interface TokenProps {
  children: number | string;
  fontSize?: string;
  innerRef?: React.RefObject<HTMLElement>;
}

function Token(props: TokenProps) {
  return (
    <div className="flexRow center" style={{ gap: "0.2em", fontSize: props.fontSize ?? "" }}>
      <img className="flexRow center" style={{ width: "1.2em", height: "1.2em" }} src={Ton} alt="TON" />
      <span ref={props.innerRef} className="flexRow center" style={{ paddingBottom: "0.1em"}}>{props.children}</span>
    </div>
  );
}

export default Token;
