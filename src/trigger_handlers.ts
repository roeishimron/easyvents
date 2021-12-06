function trigger_handler() {
  let chosen_trigger = prompt_dict(
    "What kind of trigger? (ready = once the form is ready)",
    {
      click: "click",
      change: "change",
      ready: "ready",
    }
  );

  if (chosen_trigger == "ready") {
    setTimeout(() => {
      trigger = new DocumentReadyTrigger();
      condition_handler();
    }, 1);
    return;
  }

  choose_input("input trigger", (i: Input) => {
    trigger = new InputTrigger(i, chosen_trigger);
    condition_handler();
  });
}
