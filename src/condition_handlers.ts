function condition_handler() {
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
    condition = new VisibleCondition(input, v);
    action_handler();
  })
}

function value_condition_handler(input: Input) {
  call_with_chosen_value(function (v: Value) {
    condition = new ValueCondition(input, v.val());
    action_handler();
  });
}
