var actions: Actions;

function choose_action() {
  let options = {
    visibility: setvisibility_action_handler,
    value: setvalue_action_handler,
  };

  let chosen_handler: (Input) => void = prompt_dict(
    "Choose the type of property to set",
    options
  );

  choose_input("setter", (i: Input) => {
    let should_pick_element = confirm(
      "would you like to pick a close element instead (like the closest table row)?"
    );

    if (should_pick_element) {
      get_element(i, chosen_handler);
    } else {
      chosen_handler(i);
    }
  });
}

function action_handler() {
  actions = new Actions();
  choose_action();
}

function setvisibility_action_handler(element: WebElement) {
  call_with_chosen_visibility((v: Visibility) => {
    action_end(new SetVisibilityAction(element, v));
  });
}

function setvalue_action_handler(input: Input) {
  call_with_chosen_value((v: Value) => {
    action_end(new SetValueAction(input, v));
  });
}

function action_end(a: Action) {
  actions.add_action(a);
  if (confirm("would you like to enter another action?")) {
    choose_action();
  } else {
    action = actions;
    finish();
  }
}
