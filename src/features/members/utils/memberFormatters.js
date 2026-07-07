export function getMemberId(member) {
  return member.id ?? member._id ?? member.membershipId;
}

export function getMemberUser(member) {
  return member.user ?? member.userId ?? {};
}
