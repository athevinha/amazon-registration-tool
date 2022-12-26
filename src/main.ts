import { setTimeout } from "timers/promises";
import App from "./app.js";
import i_art_twiilo from "./libs/i_art_twilo.js";

(async () => {
  const app = new App()
  await app.start()

})();