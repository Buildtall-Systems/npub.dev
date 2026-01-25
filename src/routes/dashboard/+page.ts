import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";
import { authStore } from "$lib/stores/authStore";
import { browser } from "$app/environment";
import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  if (browser) {
    const auth = get(authStore);
    if (!auth.pubkey) {
      throw redirect(302, "/");
    }
  }
  return {};
};
