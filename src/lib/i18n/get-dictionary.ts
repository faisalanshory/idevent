import { cookies } from "next/headers";
import { dictionaries, Language } from "./dictionaries";

export async function getDictionary() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("NEXT_LOCALE")?.value as Language) || "id";
  
  if (dictionaries[lang]) {
    return { dict: dictionaries[lang], lang };
  }
  
  return { dict: dictionaries.id, lang: "id" };
}
