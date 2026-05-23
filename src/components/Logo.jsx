import LogoImg from "../assets/logo_bg.png";

export default function Logo({ size = 28, alt = "Cube Solve" }) {
  return (
    <img
      src={LogoImg}
      alt={alt}
      style={{ width: size, height: 'auto', display: 'block' }}
    />
  );
}
