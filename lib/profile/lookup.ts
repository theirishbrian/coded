import "server-only";
import { createProfileServices } from "./services";
export const { lookupProfile, repositoriesFor } = createProfileServices();
