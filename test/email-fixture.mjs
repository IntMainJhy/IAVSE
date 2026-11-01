// Trusted local signup fixture supplies the explicit current-document acknowledgment.
// It never marks a mailbox verified or bypasses production-origin checks.
export function verifiedSignup(input){return{...input,email:input.email||input.username+'@example.com',policyRead:input.policyRead??['community','disclaimer']}}
