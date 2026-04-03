export function getInitials(name) {
  if (!name) return "U";

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function isGenericUiAvatar(url = "") {
  const value = String(url || "").toLowerCase();
  if (!value.includes("ui-avatars.com/api")) return false;

  return ["name=user", "name=unknown+user", "name=tutor", "name=learner"].some(
    (token) => value.includes(token)
  );
}

export function buildAvatarData(person = {}, fallbackName = "User") {
  const safePerson = person || {};

  const firstName = safePerson.firstName || "";
  const lastName = safePerson.lastName || "";

  const resolvedName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    safePerson.name ||
    safePerson.tutorName ||
    safePerson.otherUserName ||
    safePerson.displayName ||
    fallbackName;

  const imageCandidate =
    safePerson.profileImageUrl ||
    safePerson.profilePicture ||
    safePerson.avatar ||
    safePerson.image ||
    null;

  const image = isGenericUiAvatar(imageCandidate) ? null : imageCandidate;

  const parts = String(resolvedName).trim().split(/\s+/).filter(Boolean);

  const fallbackInitials =
    parts.length === 0
      ? "U"
      : parts.length === 1
        ? parts[0].slice(0, 2).toUpperCase()
        : `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();

  const initials =
    safePerson.initials ||
    (firstName || lastName
      ? getInitials(`${firstName} ${lastName}`.trim())
      : fallbackInitials);

  return {
    name: resolvedName,
    image,
    initials,
    hasImage: Boolean(image),
  };
}