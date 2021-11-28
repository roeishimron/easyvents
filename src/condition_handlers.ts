var conditions: ConnectedConditions;

function condition_handler() {
  condition = new NoCondition();
  conditions = new ConnectedConditions();

  if (!confirm("would you like to enter a condition?")) {
    return action_handler();
  }

  condition_chooser();
}

function condition_chooser() {
  let options = {
    value: value_condition_handler,
    visibility: visibilty_condition_handler,
  };

  let handler: (Input) => void = prompt_dict(
    "Choose the type of condition",
    options
  );

  choose_input("condition", handler);
}

function visibilty_condition_handler(input: Input) {
  call_with_chosen_visibility((v: Visibility) => {
    condition_end(new VisibleCondition(input, v));
  });
}

function value_condition_handler(input: Input) {
  call_with_chosen_value(function (v: Value) {
    condition_end(new ValueCondition(input, v));
  });
}

function condition_end(c: Condition) {
  let options = {
    no: Connector.none,
    and: Connector.and,
    or: Connector.or,
  };

  let chosen = prompt_dict(
    "please choose a connection to the next condition ('no' will skip to the next part)",
    options
  );

  conditions.add_condition(new ConnectedCondition(c, chosen));

  if (chosen == Connector.none) {
    condition = conditions;
    action_handler();
  } else {
    condition_chooser();
  }
}
