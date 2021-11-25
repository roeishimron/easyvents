function action_handler() {
  let options = {
    visibility: setvisibility_action_handler,
    value: setvisibility_action_handler
  }

  let handler: (Input) => void = prompt_dict(
    "Choose the type of property to set",
    options
  );

  choose_input("setter", handler);
}

function setvisibility_action_handler(input: Input) {
  call_with_chosen_visibility((v: Visibility) => {
    action = new SetVisibilityAction(input, v);
    finish();
  });
}

function setvalue_action_handler(input: Input) {
  call_with_chosen_value((v: Value) => {
    action = new SetValueAction(input, v);
    finish();
  });
}