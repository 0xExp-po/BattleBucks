import ProfilePic from "../assets/profile.png"

interface AvatarProps {
  size?: string;
}

function Avatar(props: AvatarProps) {
  const size = props.size ?? "7em";
  return (
    <div style={{ borderRadius: 999, width: size, height: size, border: "5px solid rgb(28, 29, 32)" }}>
      <img style={{ borderRadius: 999, width: "100%", height: "100%", background: "white" }} src={ProfilePic}></img>
    </div>
  );
}

export default Avatar;
