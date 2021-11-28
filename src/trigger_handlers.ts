
function trigger_choose_handler(input: Input) {
    let name_to_type = {
      click: TriggerType.click,
      change: TriggerType.change,
    };
  
    trigger = new Trigger(
      input,
      prompt_dict("What kind of trigger?", name_to_type)
    );
  
    condition_handler();
  }
  