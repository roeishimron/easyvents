
function condition_handler() {
    let options = {
      value: value_condition_handler,
      visibility: visibilty_condition_handler,
    };
  
    let handler : (Input) => void = prompt_dict("Choose the type of condition", options);
    console.log(handler);
  
    choose_input("condition", handler);
  }
  
  function visibilty_condition_handler(input: Input) {
    let options = {
      visible: new LiteralVisibilty(true),
      invisible: new LiteralVisibilty(false),
      "like other": null,
    };
  
    let chosen = prompt_dict("What visibility to compare to?", options);
    if (chosen != null) {
      condition = new VisibleCondition(input, chosen);
      choose_input("action", action_handler);
    } else {
      choose_input("other's visability", (i: Input) => {
        condition = new VisibleCondition(input, i);
        choose_input("action", action_handler);
      });
    }
  }
  
  function value_condition_handler(input: Input) {
    call_with_chosen_value(function (v: Value) {
      condition = new ValueCondition(input, v.val());
      choose_input("action", action_handler);
    });
  }
  