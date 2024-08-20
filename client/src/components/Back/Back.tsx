import { useNavigate } from "react-router";

interface BackProps {
  color?: string;
}

function Back(props: BackProps) {
  const navigate = useNavigate();
  return (
    <svg width="800px" height="800px" viewBox="0 0 1024 1024" onClick={() => navigate(-1)} style={{ width: "1.8em", height: "1.8em", cursor: "pointer" }} xmlns="http://www.w3.org/2000/svg">
      <path fill={props.color ?? "var($test)"} d="M685.248 104.704a64 64 0 010 90.496L368.448 512l316.8 316.8a64 64 0 01-90.496 90.496L232.704 557.248a64 64 0 010-90.496l362.048-362.048a64 64 0 0190.496 0z" />
    </svg>
  );
}

export default Back;
