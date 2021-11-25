
function choose_input(reason: String, callback: (Input) => void) {
    alert("choose an input for " + reason);
    is_choosing = true;
    handler = (i: Input) => {
      console.log("asked to choose an input for " + reason, " chosen " + i.id);
      callback(i);
    };
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
  
    while (!Object.keys(dict).includes(chosen)){
      chosen = prompt(
        message + " options are: " + Object.keys(dict).join(", "),
        Object.keys(dict)[default_index]
      );
    }
  
    console.log("asked for " + message, ", chosen " + chosen);
  
    return dict[chosen];
  }