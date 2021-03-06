function choose_input(reason: String, callback: (Input) => void) {
  alert("choose an input for " + reason);
  is_choosing = true;
  handler = (i: Input) => {
    console.log("asked to choose an input for " + reason, " chosen " + i.id);
    callback(i);
  };
}

function get_element(input: Input, callback: (WebElement) => void) {
  let options = {
    tr: "tr",
    td: "td",
  };

  callback(
    input.closest(
      prompt_dict("We'll choose the closest instance of your choise.", options)
    )
  );
}

function call_with_chosen_value(callback: (Value) => void) {
  let type_to_value = {
    literal: function (clbck: (Input) => void) {
      clbck(new StringValue(prompt("enter value")));
    },
    input: function (clbck: (Input) => void) {
      choose_input("getting value from that input", clbck);
    },
  };

  prompt_dict("Choose value type.", type_to_value)(callback);
}

function prompt_dict(message, dict, default_index = 0) {
  let chosen = "__NO_SUCH_vALUE_EVER__";

  while (!Object.keys(dict).includes(chosen)) {
    chosen = prompt(
      message + " options are: " + Object.keys(dict).join(", "),
      Object.keys(dict)[default_index]
    );
  }

  console.log("asked for " + message, ", chosen " + chosen);

  return dict[chosen];
}

function call_with_chosen_visibility(callback: (Visibility) => void) {
  let options = {
    visible: new LiteralVisibilty(true),
    invisible: new LiteralVisibilty(false),
    "like other": null,
  };

  let chosen = prompt_dict("What visibility to compare to?", options);

  if (chosen != null) {
    callback(chosen);
  } else {
    choose_input("other input to compare visability with", (i: Input) => {
      callback(i);
    });
  }
}
