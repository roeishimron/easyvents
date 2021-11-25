function action_handler(input: Input) {
    action = new SetValueAction(input, prompt("enter the new val"));
  
    alert("Here you go\n" + new Rule(trigger, condition, action).to_jquery());
  }