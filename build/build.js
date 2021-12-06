var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var actions;
function choose_action() {
    var options = {
        visibility: setvisibility_action_handler,
        value: setvalue_action_handler,
    };
    var chosen_handler = prompt_dict("Choose the type of property to set", options);
    choose_input("setter", function (i) {
        var should_pick_element = confirm("would you like to pick a close element instead (like the closest table row)?");
        if (should_pick_element) {
            get_element(i, chosen_handler);
        }
        else {
            chosen_handler(i);
        }
    });
}
function action_handler() {
    actions = new Actions();
    choose_action();
}
function setvisibility_action_handler(element) {
    call_with_chosen_visibility(function (v) {
        action_end(new SetVisibilityAction(element, v));
    });
}
function setvalue_action_handler(input) {
    call_with_chosen_value(function (v) {
        action_end(new SetValueAction(input, v));
    });
}
function action_end(a) {
    actions.add_action(a);
    if (confirm("would you like to enter another action?")) {
        choose_action();
    }
    else {
        action = actions;
        finish();
    }
}
var conditions;
function condition_handler() {
    condition = new NoCondition();
    conditions = new ConnectedConditions();
    if (!confirm("would you like to enter a condition?")) {
        return action_handler();
    }
    condition_chooser();
}
function condition_chooser() {
    var options = {
        value: value_condition_handler,
        visibility: visibilty_condition_handler,
    };
    var handler = prompt_dict("Choose the type of condition", options);
    choose_input("condition", handler);
}
function visibilty_condition_handler(input) {
    call_with_chosen_visibility(function (v) {
        condition_end(new VisibleCondition(input, v));
    });
}
function value_condition_handler(input) {
    call_with_chosen_value(function (v) {
        condition_end(new ValueCondition(input, v));
    });
}
function condition_end(c) {
    var options = {
        no: Connector.none,
        and: Connector.and,
        or: Connector.or,
    };
    var chosen = prompt_dict("please choose a connection to the next condition ('no' will skip to the next part)", options);
    conditions.add_condition(new ConnectedCondition(c, chosen));
    if (chosen == Connector.none) {
        condition = conditions;
        action_handler();
    }
    else {
        condition_chooser();
    }
}
var trigger;
var condition;
var action;
var is_choosing = false;
var handler;
function flow() {
    console.log("#we started");
    trigger_handler();
}
function finish() {
    alert("Here you go\n" + new Rule(trigger, condition, action).to_jquery());
}
$(function () {
    $(":input").each(function (i, input) {
        input.addEventListener("click", function (event) {
            if (!is_choosing) {
                return true;
            }
            $(this).blur();
            event.stopImmediatePropagation();
            event.preventDefault();
            is_choosing = false;
            handler(new Input($(this).attr("id")));
        }, false);
    });
    flow();
});
function trigger_handler() {
    var name_to_type = {
        click: "click",
        change: "change",
        ready: "ready",
    };
    var chosen_trigger = prompt_dict("What kind of trigger? (ready = once the form is ready)", name_to_type);
    if (chosen_trigger == "ready") {
        setTimeout(function () {
            trigger = new DocumentReadyTrigger();
            condition_handler();
        }, 1);
        return;
    }
    choose_input("input trigger", function (i) {
        trigger = new InputTrigger(i, chosen_trigger);
        condition_handler();
    });
}
var StringValue = /** @class */ (function () {
    function StringValue(s) {
        this.s = s;
    }
    StringValue.prototype.val = function () {
        return "'" + this.s + "'";
    };
    return StringValue;
}());
var LiteralVisibilty = /** @class */ (function () {
    function LiteralVisibilty(i) {
        this.i = i;
    }
    LiteralVisibilty.prototype.visibility = function () {
        return this.i;
    };
    return LiteralVisibilty;
}());
var WebElement = /** @class */ (function () {
    function WebElement(id, is_raw) {
        if (is_raw === void 0) { is_raw = true; }
        this.id = "";
        this.id = id;
        this.is_raw = is_raw;
    }
    WebElement.prototype.closest = function (type) {
        return new WebElement(this.as_jquery() + ".closest('" + type + "')", false);
    };
    WebElement.prototype.as_jquery = function () {
        if (this.is_raw) {
            return "$('#" + this.id + "')";
        }
        return this.id;
    };
    WebElement.prototype.visibility = function () {
        return this.as_jquery() + '.is(":visible")';
    };
    WebElement.prototype.set_visibility = function (v) {
        return (this.as_jquery() +
            ".each(function(){this.style.setProperty('display', {true: 'inline-block', false: 'none'}[" +
            v.visibility() +
            "], 'important')})");
    };
    return WebElement;
}());
var Input = /** @class */ (function (_super) {
    __extends(Input, _super);
    function Input(id) {
        return _super.call(this, id) || this;
    }
    Input.prototype.val = function () {
        return this.as_jquery() + ".val()";
    };
    Input.prototype.set_val = function (v) {
        return this.as_jquery() + ".val(" + v.val() + ")";
    };
    return Input;
}(WebElement));
var TriggerType;
(function (TriggerType) {
    TriggerType[TriggerType["click"] = 0] = "click";
    TriggerType[TriggerType["change"] = 1] = "change";
})(TriggerType || (TriggerType = {}));
var DocumentReadyTrigger = /** @class */ (function () {
    function DocumentReadyTrigger() {
    }
    DocumentReadyTrigger.prototype.create_handeled_trigger = function (handler) {
        return "$(document).ready(" + handler + ")";
    };
    return DocumentReadyTrigger;
}());
var InputTrigger = /** @class */ (function () {
    function InputTrigger(input, trigger) {
        this.input = input;
        this.trigger = trigger;
    }
    InputTrigger.prototype.create_handeled_trigger = function (handler) {
        return this.input.as_jquery() + "." + this.trigger + "(" + handler + ")";
    };
    return InputTrigger;
}());
var Connector;
(function (Connector) {
    Connector["and"] = "&&";
    Connector["or"] = "||";
    Connector["none"] = "";
})(Connector || (Connector = {}));
var ConnectedCondition = /** @class */ (function () {
    function ConnectedCondition(lhs, conn) {
        if (conn === void 0) { conn = Connector.none; }
        this.lhs = lhs;
        this.connector = conn;
    }
    ConnectedCondition.prototype.validation = function () {
        return this.lhs.validation() + this.connector;
    };
    return ConnectedCondition;
}());
var ConnectedConditions = /** @class */ (function () {
    function ConnectedConditions() {
        this.current_conditions = new Array();
    }
    ConnectedConditions.prototype.validation = function () {
        var res = "";
        this.current_conditions.forEach(function (c) {
            res += c.validation();
        });
        return res;
    };
    ConnectedConditions.prototype.add_condition = function (c) {
        this.current_conditions.push(c);
    };
    return ConnectedConditions;
}());
var ValueCondition = /** @class */ (function () {
    function ValueCondition(input, required_value) {
        this.input = input;
        this.required_value = required_value;
    }
    ValueCondition.prototype.validation = function () {
        return "(" + this.input.val() + "==" + this.required_value.val() + ")";
    };
    return ValueCondition;
}());
var VisibleCondition = /** @class */ (function () {
    function VisibleCondition(element, required_visibility) {
        this.element = element;
        this.required_visibility = required_visibility;
    }
    VisibleCondition.prototype.validation = function () {
        return ("(" +
            this.element.visibility() +
            "==" +
            this.required_visibility.visibility() +
            ")");
    };
    return VisibleCondition;
}());
var NoCondition = /** @class */ (function () {
    function NoCondition() {
    }
    NoCondition.prototype.validation = function () {
        return "true";
    };
    return NoCondition;
}());
var SetValueAction = /** @class */ (function () {
    function SetValueAction(input, value_to_set) {
        this.input = input;
        this.value_to_set = value_to_set;
    }
    SetValueAction.prototype.get_action = function () {
        return this.input.set_val(this.value_to_set);
    };
    return SetValueAction;
}());
var SetVisibilityAction = /** @class */ (function () {
    function SetVisibilityAction(element, visibility_to_set) {
        this.element = element;
        this.visibility_to_set = visibility_to_set;
    }
    SetVisibilityAction.prototype.get_action = function () {
        return this.element.set_visibility(this.visibility_to_set);
    };
    return SetVisibilityAction;
}());
var Actions = /** @class */ (function () {
    function Actions() {
        this.actions = new Array();
    }
    Actions.prototype.add_action = function (a) {
        this.actions.push(a);
    };
    Actions.prototype.get_action = function () {
        var res = "";
        this.actions.forEach(function (a) {
            res += a.get_action() + ";\n";
        });
        return res;
    };
    return Actions;
}());
var Rule = /** @class */ (function () {
    function Rule(trigger, condition, action) {
        this.trigger = trigger;
        this.condition = condition;
        this.action = action;
    }
    Rule.prototype.to_jquery = function () {
        var handler = "function() {if(" +
            this.condition.validation() +
            "){" +
            this.action.get_action() +
            "}}";
        return this.trigger.create_handeled_trigger(handler);
    };
    return Rule;
}());
function choose_input(reason, callback) {
    alert("choose an input for " + reason);
    is_choosing = true;
    handler = function (i) {
        console.log("asked to choose an input for " + reason, " chosen " + i.id);
        callback(i);
    };
}
function delay_compilation(callback) {
    callback();
}
function get_element(input, callback) {
    var options = {
        tr: "tr",
        td: "td",
    };
    callback(input.closest(prompt_dict("We'll choose the closest instance of your choise.", options)));
}
function call_with_chosen_value(callback) {
    var type_to_value = {
        literal: function (clbck) {
            clbck(new StringValue(prompt("enter value")));
        },
        input: function (clbck) {
            choose_input("getting value from that input", clbck);
        },
    };
    prompt_dict("Choose value type.", type_to_value)(callback);
}
function prompt_dict(message, dict, default_index) {
    if (default_index === void 0) { default_index = 0; }
    var chosen = "__NO_SUCH_vALUE_EVER__";
    while (!Object.keys(dict).includes(chosen)) {
        chosen = prompt(message + " options are: " + Object.keys(dict).join(", "), Object.keys(dict)[default_index]);
    }
    console.log("asked for " + message, ", chosen " + chosen);
    return dict[chosen];
}
function call_with_chosen_visibility(callback) {
    var options = {
        visible: new LiteralVisibilty(true),
        invisible: new LiteralVisibilty(false),
        "like other": null,
    };
    var chosen = prompt_dict("What visibility to compare to?", options);
    if (chosen != null) {
        callback(chosen);
    }
    else {
        choose_input("other input to compare visability with", function (i) {
            callback(i);
        });
    }
}
//# sourceMappingURL=build.js.map