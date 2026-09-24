import "server-only";
import { getPublicProfile } from "./get-profile";
import { createProfileLookup } from "./lookup-policy";
export const lookupProfile = createProfileLookup(getPublicProfile);
