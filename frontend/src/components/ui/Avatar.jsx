import { buildAvatarData } from "../../utils/avatar";

export default function Avatar({ person, size = 40, fallbackName = "User" }) {
  const avatar = buildAvatarData(person, fallbackName);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        fontSize: size * 0.4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E8E0D8",
        color: "#7A0000",
        fontWeight: "bold",
        flexShrink: 0,
      }}
    >
      {/* ALWAYS initials — no image at all */}
      <span>{avatar.initials}</span>
    </div>
  );
}