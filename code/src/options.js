function clearOptions() {
    // TODO: Confirm this is what the user wants!
    chrome.extension.getBackgroundPage().clearOptions(function onClearOptionsSuccess() {
        setStatus("Options cleared");
        $("#urls").empty();
    }, function onClearOptionsFail() {
        setStatus("Options failed to clear");
    });
}

function refreshPage() {
    location.reload();
}

function saveOptions() {
	// Store an array of regular expressions
	var regularExpressions = [];
	
	// Populate the array based on the form
	$("#urls .option").each(function (index, value) {
		// Get the option
		var entry = $(value);
		var regex = entry.find(".regex").val();
		var title = entry.find(".newtitle").val();
		var id = entry.find(".id").val();

		if ("" !== regex) {
			// Add the regular expression
			regularExpressions.push({
				regex: regex,
				title: title,
				id: id
			});
		}
	});

    // Save the option object
	chrome.extension.getBackgroundPage().saveURLOption(regularExpressions, function onSaveURLSuccess() {
	    setStatus("Options saved");
	},
    function onSaveURLFail() {
        setStatus("Options could not be saved");
    });
	
}

function setStatus(text) {
    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = text;
    setTimeout(function () {
        status.innerHTML = "";
    }, 750);
}

// Restores select box state to saved value from localStorage.
function restoreOptions() {

    // Get the regular expressions from storage
    chrome.extension.getBackgroundPage().getURLOption(function (regexes) {
        var index, entry;

        if (null !== regexes) {
            for (index in regexes) {
                entry = addRegularExpressionField();
                entry.find(".regex").val(regexes[index].regex);
                entry.find(".newtitle").val(regexes[index].title);
                entry.find(".id").val(regexes[index].id);
            }
        }
    });

}

function addRegularExpressionField() {
	// The root of the regular expression options
    var regularExpressionOptionsRoot = $("#urls");
	
	// Create a new entry
    var newEntry = $("<div class='option'><input type='hidden' class='id' value='" + new Date().getTime() + "'>URL: <input type='text' class='regex'/>Title: <input type='text' class='newtitle'/><button class='remove'>X</button></div>");
	
	// Add a button handler for removing
	newEntry.find(".remove").click(function() {
		$(newEntry).hide();
		$(newEntry).find(".regex").val("");
	});
	
	// Add the new entry to the root element
	regularExpressionOptionsRoot.append(newEntry);

	// Return the new entry
	return newEntry; 
}


// Event handlers
document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('#save').addEventListener('click', saveOptions);
document.querySelector('#add').addEventListener('click', addRegularExpressionField);
document.querySelector('#clear').addEventListener('click', clearOptions);