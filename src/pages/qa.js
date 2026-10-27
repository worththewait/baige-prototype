(() => {
  "use strict";
  window.BaigePage.onActivate(({ child }) => {
    if (child !== "智能问数") window.BaigePage.navigate("home");
  });
})();
